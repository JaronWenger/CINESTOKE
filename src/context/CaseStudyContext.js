// Context for sharing active client between ClientsV2 and CaseStudy
import React, { createContext, useContext, useState } from 'react';

const CaseStudyContext = createContext();

export const useCaseStudy = () => {
  const context = useContext(CaseStudyContext);
  if (!context) {
    throw new Error('useCaseStudy must be used within CaseStudyProvider');
  }
  return context;
};

export const CaseStudyProvider = ({ children }) => {
  const [activeClient, setActiveClient] = useState(null); // null or client name like "SWA"

  return (
    <CaseStudyContext.Provider value={{ activeClient, setActiveClient }}>
      {children}
    </CaseStudyContext.Provider>
  );
};

