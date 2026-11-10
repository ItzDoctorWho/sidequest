import React, { useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { registerUser, clearAuthError } from '../redux/authSlice.js';
import Alert from '../components/Alert.jsx';
import { LogoIcon } from '../components/brand/Logo.jsx';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const hintId = useId();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(registerUser({ name, email, password }));
    if (!result.error) {
      navigate(location.state?.from || '/', { replace: true });
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="page flex min-h-[70dvh] items-center">
      <div className="surface relative mx-auto w-full max-w-sm overflow-hidden rounded-xl p-6 sm:p-8">
        <div className="topo opacity-60" aria-hidden="true" />
        <div className="relative">
          <LogoIcon className="size-12" />
          <h1 className="mt-5 text-3xl">Join SideQuest</h1>
          <p className="muted mt-1 text-sm">Keep your quests, finish challenges and earn badges.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor={nameId} className="field-label">
                Name
              </label>
              <input
                id={nameId}
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="field"
              />
            </div>

            <div>
              <label htmlFor={emailId} className="field-label">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor={passwordId} className="field-label">
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-describedby={hintId}
                className="field"
              />
              <p id={hintId} className="muted mt-1.5 text-sm">
                At least 6 characters.
              </p>
            </div>

            {error && <Alert>{error}</Alert>}

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="muted mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="focus-ring rounded-sm font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
