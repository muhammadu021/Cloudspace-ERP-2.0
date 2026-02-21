import { createContext, useContext, useState, useCallback } from 'react';

const PageHeaderContext = createContext();

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  }
  return context;
};

export const PageHeaderProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageActions, setPageActionsState] = useState([]);

  // Wrap setPageActions to avoid React comparison issues with JSX elements
  const setPageActions = useCallback((actions) => {
    setPageActionsState(actions);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      pageActions, 
      setPageActions
    }}>
      {children}
    </PageHeaderContext.Provider>
  );
};
