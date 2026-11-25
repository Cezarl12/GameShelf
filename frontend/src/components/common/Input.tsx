import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

function Input({
  label,
  error,
  helperText,
  id,
  name,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        className={`w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-primary/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-xs text-text-secondary"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
