import { useState, useEffect } from 'react';
import { TimelinePage } from './features/timeline/TimelinePage';
import { PropertiesPage } from './features/properties/PropertiesPage';
import { SyncPage } from './features/sync/SyncPage';

type Route = 'timeline' | 'settings' | 'sync';

function getRoute(): Route {
  const hash = window.location.hash.slice(1);
  if (hash === 'settings') return 'settings';
  if (hash === 'sync') return 'sync';
  return 'timeline';
}

export function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (r: Route) => {
    window.location.hash = r === 'timeline' ? '' : r;
    setRoute(r);
  };

  return (
    <>
      <nav className="app-nav">
        <span className="nav-brand">Domestica Hobart Master Calendar</span>
        <button
          className={`nav-link ${route === 'timeline' ? 'active' : ''}`}
          onClick={() => navigate('timeline')}
        >
          Timeline
        </button>
        <button
          className={`nav-link ${route === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('settings')}
        >
          Properties
        </button>
        <button
          className={`nav-link ${route === 'sync' ? 'active' : ''}`}
          onClick={() => navigate('sync')}
        >
          Sync
        </button>
      </nav>

      {route === 'timeline' && <TimelinePage />}
      {route === 'settings' && <PropertiesPage />}
      {route === 'sync' && <SyncPage />}
    </>
  );
}
