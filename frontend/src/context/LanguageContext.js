import React, { createContext, useState, useContext,useEffect } from 'react';

// Create the context
const LanguageContext = createContext();

// Create the provider component
export const LanguageProvider = ({ children }) => {
 // Retrieve the language from localStorage or default to 'netherland'
 const [language, setLanguage] = useState(localStorage.getItem('language') || 'nl');

 useEffect(() => {
    // Save the language to localStorage whenever it changes
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
