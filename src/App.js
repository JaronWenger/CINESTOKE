import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Offers from './components/Offers';
import Links from './components/Links';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/links" element={<Links />} />
      </Routes>
    </Router>
  );
}

export default App;