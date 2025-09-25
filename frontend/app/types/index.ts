export interface Dispute {
  id: number;
  dispute_id: string;
  customer_id: string;
  txn_id: string;
  description: string;
  predicted_category: 'DUPLICATE_CHARGE' | 'FAILED_TRANSACTION' | 'FRAUD' | 'REFUND_PENDING' | 'OTHERS';
  confidence: number;
  explanation: string;
  suggested_action: string;
  justification: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  created_at: string; // This will be an ISO string date
}

export interface DisputeHistory {
  id: number;
  dispute_id: string;
  timestamp: string; // This will be an ISO string date
  field_changed: string;
  old_value: string;
  new_value: string;
}
