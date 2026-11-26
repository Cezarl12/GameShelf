type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

function LoadingSpinner({
  size = 'md',
  label = 'Se încarcă...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
      />
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );
}

export default LoadingSpinner;
