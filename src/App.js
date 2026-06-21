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