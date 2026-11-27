import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';

interface LocationState {
  from?: {
    pathname: string;
  };
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/library';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const validate = (): boolean => {
    const nextErrors: LoginFormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Adresa de email este obligatorie.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Adresa de email este invalidă.';
    }

    if (!password) {
      nextErrors.password = 'Parola este obligatorie.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(
        getApiErrorMessage(err, 'Autentificarea a eșuat. Verifică datele.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-8">
      <Card padding="lg">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.svg" alt="GameShelf" className="h-10 w-auto" />
          <p className="mt-2 text-sm text-text-secondary">
            Bine ai revenit în biblioteca ta de jocuri.
          </p>
        </div>

        {/* Switcher Autentificare / Inregistrare */}
        <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-center text-sm font-medium">
          <span className="rounded-md bg-surface py-1.5 text-primary shadow-xs">
            Autentificare
          </span>
          <Link
            to="/register"
            className="rounded-md py-1.5 text-text-secondary transition-colors hover:text-text-primary"
          >
            Înregistrare
          </Link>
        </div>

        <div className="mt-6">
          <h1 className="font-display text-xl font-bold text-text-primary">
            Conectează-te la cont
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Introdu adresa de email și parola pentru a continua.
          </p>
        </div>

        {serverError && (
          <Alert variant="error" className="mt-4">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nume@exemplu.ro"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            required
          />

          <div className="relative">
            <Input
              label="Parolă"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={errors.password}
              className="pr-16"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {showPassword ? 'Ascunde' : 'Arată'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            Autentificare
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Nu ai cont încă?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Creează unul
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;
