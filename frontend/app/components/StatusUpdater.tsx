// src/app/components/StatusUpdater.tsx

'use client'; // This directive is ESSENTIAL. It marks this as a Client Component.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // A hook for programmatically changing routes

// Define the possible statuses
const STATUSES = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

interface StatusUpdaterProps {
  disputeId: string;
  currentStatus: string;
}

export default function StatusUpdater({ disputeId, currentStatus }: StatusUpdaterProps) {
  // State to hold the selected status from the dropdown
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our FastAPI backend's PUT endpoint
      const response = await fetch(`http://127.0.0.1:8000/api/disputes/${disputeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // If the update is successful, we want to refresh the page to show the new data
      // router.refresh() is a powerful Next.js feature that re-fetches data on the server
      // without losing the user's scroll position or triggering a full page reload.
      router.refresh();

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Update Case Status</h2>
      <div className="flex items-center space-x-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={isLoading || selectedStatus === currentStatus}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
