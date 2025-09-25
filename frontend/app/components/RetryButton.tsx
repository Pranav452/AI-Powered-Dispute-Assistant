'use client';

interface RetryButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function RetryButton({ className, children }: RetryButtonProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <button 
      onClick={handleRetry}
      className={className}
    >
      {children}
    </button>
  );
}
