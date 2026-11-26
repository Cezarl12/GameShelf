import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

export default Alert;
