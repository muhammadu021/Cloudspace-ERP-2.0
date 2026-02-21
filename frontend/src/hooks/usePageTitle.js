import { useEffect, useRef } from 'react';
import { usePageHeader } from '../contexts/PageHeaderContext';

/**
 * Custom hook to set page title and actions in the top navigation bar
 * 
 * @param {string} title - The page title to display
 * @param {Array} actions - Array of React elements (buttons, etc.) to display as quick actions
 * 
 * @example
 * usePageTitle('Inventory Dashboard', [
 *   <Button key="add" onClick={handleAdd}>Add Item</Button>,
 *   <Button key="export" variant="outline">Export</Button>
 * ]);
 */
export const usePageTitle = (title, actions = []) => {
  const { setPageTitle, setPageActions } = usePageHeader();
  const actionsRef = useRef(actions);
  const isMountedRef = useRef(false);

  // Update actions ref on every render
  actionsRef.current = actions;

  useEffect(() => {
    // Set title
    setPageTitle(title);
    
    // Set actions only once on mount or when length changes
    if (!isMountedRef.current || actions.length !== actionsRef.current.length) {
      setPageActions(actions);
      isMountedRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      setPageTitle('');
      setPageActions([]);
      isMountedRef.current = false;
    };
  }, [title, actions.length, setPageTitle, setPageActions]);
};
