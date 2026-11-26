import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';

interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/library" replace />;
  }

  const validate = (): boolean => {
    const nextErrors: RegisterFormErrors = {};
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      nextErrors.username = 'Numele afișat este obligatoriu.';
    } else if (trimmedUsername.length < 2) {
      nextErrors.username =
        'Numele afișat trebuie să aibă cel puțin 2 caractere.';
    } else if (trimmedUsername.length > 50) {
      nextErrors.username = 'Numele afișat poate avea maximum 50 de caractere.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Adresa de email este obligatorie.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Adresa de email este invalidă.';
    }

    if (!password) {
      nextErrors.password = 'Parola este obligatorie.';
    } else if (password.length < 8) {
      nextErrors.password = 'Parola trebuie să conțină cel puțin 8 caractere.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirmarea parolei este obligatorie.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Parolele nu coincid.';
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
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      navigate('/library', { replace: true });
    } catch (err) {
      setServerError(
        getApiErrorMessage(err, 'Înregistrarea a eșuat. Încearcă din nou.')
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
            Organizează-ți colecția de jocuri într-un singur loc.
          </p>
        </div>

        {/* Switcher Autentificare / Inregistrare */}
        <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-center text-sm font-medium">
          <Link
            to="/login"
            className="rounded-md py-1.5 text-text-secondary transition-colors hover:text-text-primary"
          >
            Autentificare
          </Link>
          <span className="rounded-md bg-surface py-1.5 text-primary shadow-xs">
            Înregistrare
          </span>
        </div>

        <div className="mt-6">
          <h1 className="font-display text-xl font-bold text-text-primary">
            Creează un cont nou
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Completează datele de mai jos pentru a începe.
          </p>
        </div>

        {serverError && (
          <Alert variant="error" className="mt-4">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <Input
            label="Nume utilizator"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="ex: cezar_gamer"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) {
                setErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            error={errors.username}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nume@exemplu.ro"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={errors.email}
            required
          />

          <div className="relative">
            <Input
              label="Parolă"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Minim 8 caractere"
              helperText="Parola trebuie să conțină cel puțin 8 caractere."
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

          <Input
            label="Confirmă parola"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Reintrodu parola"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            Creează cont
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Ai deja un cont?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Autentifică-te
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;
