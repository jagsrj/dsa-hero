import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useProgress } from '../state/store';
import { dueCards } from '../state/progress';
import { CelebrationModal, StreakChip, Toasts, XpChip } from './widgets';
import { ProfileChip } from './Account';

const NAV = [
  { to: '/', label: 'Home', icon: '⌂', end: true },
  { to: '/learn', label: 'Learn', icon: '🗺' },
  { to: '/review', label: 'Review', icon: '🗂' },
  { to: '/playground', label: 'Playground', icon: '⌨' },
  { to: '/profile', label: 'Profile', icon: '☺' },
];

export function Layout() {
  const s = useProgress();
  const due = dueCards(s).length;
  const loc = useLocation();
  const wide = loc.pathname.startsWith('/problem') || loc.pathname.startsWith('/exam') || loc.pathname.startsWith('/playground');

  useEffect(() => {
    const root = document.documentElement;
    const theme = s.settings.theme;
    if (theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', theme);
  }, [s.settings.theme]);

  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div className={`app ${wide ? 'wide' : ''}`}>
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="DSA Hero home">
          <span className="brand-mark" aria-hidden>{'{ }'}</span>
          <span className="brand-name">DSA <b>Hero</b></span>
        </NavLink>
        <nav className="topnav" aria-label="Main">
          {NAV.slice(1).map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'on' : '')}>
              {n.label}{n.to === '/review' && due > 0 && <span className="badge-dot">{due}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-right">
          <StreakChip />
          <XpChip />
          <ProfileChip />
        </div>
      </header>
      <main id="main" className="main">
        <Outlet />
      </main>
      <nav className="bottomnav" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'on' : '')}>
            <span className="bn-icon" aria-hidden>{n.icon}</span>
            <span>{n.label}</span>
            {n.to === '/review' && due > 0 && <span className="badge-dot">{due}</span>}
          </NavLink>
        ))}
      </nav>
      <Toasts />
      <CelebrationModal />
    </div>
  );
}
