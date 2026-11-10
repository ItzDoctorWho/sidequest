import React, { useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from '../redux/authSlice.js';
import Alert from '../components/Alert.jsx';
import { LogoIcon } from '../components/brand/Logo.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailId = useId();
  const passwordId = useId();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email, password }));
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
          <h1 className="mt-5 text-3xl">Welcome back</h1>
          <p className="muted mt-1 text-sm">Pick up your quests where you left off.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field"
              />
            </div>

            {error && <Alert>{error}</Alert>}

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="muted mt-6 text-center text-sm">
            New here?{' '}
            <Link to="/register" className="focus-ring rounded-sm font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
