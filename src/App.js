import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import ErrorBoundary from './components/ErrorBoundary';

const Offers = lazy(() => import('./components/Offers'));
const Links = lazy(() => import('./components/Links'));
const Shop = lazy(() => import('./components/Shop'));

function App() {
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('cinestoke-light') === 'true');

  useEffect(() => {
    document.body.classList.toggle('light-mode', isLightMode);
    localStorage.setItem('cinestoke-light', isLightMode);
  }, [isLightMode]);

  useEffect(() => {
    const splash = document.getElementById('cinestoke-splash');
    if (!splash) return;
    const isHome = /^\/(\d+)?$/.test(window.location.pathname);
    const exit = () => {
      document.body.classList.remove('splash-active');
      splash.classList.add('splash-exit');
      setTimeout(() => splash.remove(), 700);
    };
    if (!isHome) { document.body.classList.remove('splash-active'); splash.remove(); return; }
    let loadDone = false;
    let minDone = false;
    const tryExit = () => { if (loadDone && minDone) exit(); };
    const onLoad = () => { loadDone = true; tryExit(); };
    if (document.readyState === 'complete') { loadDone = true; }
    else { window.addEventListener('load', onLoad, { once: true }); }
    const timer = setTimeout(() => { minDone = true; tryExit(); }, 2000);
    return () => { clearTimeout(timer); window.removeEventListener('load', onLoad); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleLightMode = () => setIsLightMode(m => !m);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main onToggleLightMode={handleToggleLightMode} />} />
        <Route path="/offers" element={<Suspense fallback={null}><Offers /></Suspense>} />
        <Route path="/links" element={<Suspense fallback={null}><ErrorBoundary><Links /></ErrorBoundary></Suspense>} />
        <Route path="/shop" element={<Suspense fallback={null}><Shop onToggleLightMode={handleToggleLightMode} /></Suspense>} />
        <Route path="/shop/:productId" element={<Suspense fallback={null}><Shop onToggleLightMode={handleToggleLightMode} /></Suspense>} />
        <Route path="/:clientId" element={<Main onToggleLightMode={handleToggleLightMode} />} />
      </Routes>
    </Router>
  );
}

export default App;