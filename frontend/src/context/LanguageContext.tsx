import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import i18n from '../i18n'; // Import our i18n configuration

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(
    i18n.language // Get initial language from i18n
  );

  useEffect(() => {
    // Update i18n language when context language changes
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    console.log(`Language set to: ${language}`);
  }, [language]);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang); // Save language preference
    i18n.changeLanguage(lang); // Change language immediately
  };

  // Listen to i18n language changes to update context state
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
