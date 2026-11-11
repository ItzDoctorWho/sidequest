import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Compass, Flag, LogOut, Map, Moon, Sun, Trophy } from 'lucide-react';
import { logout } from '../redux/authSlice.js';
import { toggleTheme } from '../redux/uiSlice.js';
import Logo from './brand/Logo.jsx';
import { Sparkle } from './brand/Decor.jsx';

const navLinkClass = ({ isActive }) =>
  `focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-[background-color,color] duration-150 ease-out ${
    isActive ? 'bg-muted-fill text-fg' : 'text-fg-muted hover:bg-muted-fill hover:text-fg'
  }`;

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const Item = ({ to, icon: Icon, end, children }) => (
  <NavLink to={to} end={end} className={navLinkClass}>
    {({ isActive }) => (
      <>
        <Icon className={`size-[18px] ${isActive ? 'text-accent' : ''}`} aria-hidden="true" />
        {/* Phones: only the current page shows its label; the rest stay icon-only (still named for screen readers). */}
        <span className={isActive ? '' : 'sr-only sm:not-sr-only'}>{children}</span>
      </>
    )}
  </NavLink>
);

export const Navbar = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isSignedIn = Boolean(token && user);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page-alt">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6"
      >
        <Link to="/" aria-label="SideQuest home" className="focus-ring rounded-md py-1">
          <Logo />
        </Link>

        {/* Signed-out visitors only have Home, which the logo already covers, so the link row is hidden. */}
        {isSignedIn && (
          <div className="order-last flex w-full items-center justify-between gap-2 lg:order-none lg:w-auto lg:flex-1 lg:justify-start lg:pl-4">
            <div className="-ml-3 flex items-center gap-0.5 lg:ml-0">
              <Item to="/" end icon={Compass}>
                Home
              </Item>
              <Item to="/my-list" icon={Map}>
                Adventures
              </Item>
              <Item to="/challenges" icon={Flag}>
                Challenge
              </Item>
              <Item to="/stats" icon={Trophy}>
                Achievements
              </Item>
            </div>
            <p
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-reward tabular-nums lg:ml-auto"
              title={`${user.xp || 0} XP · ${user.streak || 0}-day streak`}
            >
              <Sparkle className="size-3.5" />
              {user.xp || 0} XP
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          {isSignedIn && (
            <span
              className="mr-1 inline-flex size-9 shrink-0 select-none items-center justify-center rounded-full border border-line bg-muted-fill font-display text-sm font-bold text-accent"
              title={user.name}
              role="img"
              aria-label={`Signed in as ${user.name}`}
            >
              {getInitials(user.name)}
            </span>
          )}
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="icon-btn"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="size-5" aria-hidden="true" />
            ) : (
              <Moon className="size-5" aria-hidden="true" />
            )}
          </button>

          {isSignedIn ? (
            <button type="button" onClick={handleLogout} className="icon-btn" aria-label="Sign out">
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
