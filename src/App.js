import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Offers from './components/Offers';
import Links from './components/Links';
import Shop from './components/Shop';
import ErrorBoundary from './components/ErrorBoundary';

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
        <Route path="/offers" element={<Offers />} />
        <Route path="/links" element={<ErrorBoundary><Links /></ErrorBoundary>} />
        <Route path="/shop" element={<Shop onToggleLightMode={handleToggleLightMode} />} />
        <Route path="/:clientId" element={<Main onToggleLightMode={handleToggleLightMode} />} />
      </Routes>
    </Router>
  );
}

export default App;