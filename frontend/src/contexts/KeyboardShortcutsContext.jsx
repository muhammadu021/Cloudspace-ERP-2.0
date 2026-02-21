import React, { createContext, useContext, useState, useCallback } from 'react';

const KeyboardShortcutsContext = createContext();

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState([
    {
      id: 'global-search',
      keys: ['ctrl+k', 'cmd+k'],
      description: 'Open global search',
      category: 'Navigation',
    },
    {
      id: 'toggle-sidebar',
      keys: ['ctrl+b', 'cmd+b'],
      description: 'Toggle sidebar',
      category: 'Navigation',
    },
    {
      id: 'go-to-dashboard',
      keys: ['g+d'],
      description: 'Go to dashboard',
      category: 'Navigation',
    },
    {
      id: 'go-to-projects',
      keys: ['g+p'],
      description: 'Go to projects',
      category: 'Navigation',
    },
    {
      id: 'go-to-hr',
      keys: ['g+h'],
      description: 'Go to HR',
      category: 'Navigation',
    },
    {
      id: 'go-to-finance',
      keys: ['g+f'],
      description: 'Go to finance',
      category: 'Navigation',
    },
    {
      id: 'go-to-sales',
      keys: ['g+s'],
      description: 'Go to sales',
      category: 'Navigation',
    },
    {
      id: 'go-to-inventory',
      keys: ['g+i'],
      description: 'Go to inventory',
      category: 'Navigation',
    },
    {
      id: 'help',
      keys: ['?'],
      description: 'Show keyboard shortcuts',
      category: 'Help',
    },
    {
      id: 'escape',
      keys: ['escape'],
      description: 'Close modal/dialog',
      category: 'General',
    },
    {
      id: 'save',
      keys: ['ctrl+s', 'cmd+s'],
      description: 'Save current form',
      category: 'Actions',
    },
    {
      id: 'new',
      keys: ['ctrl+n', 'cmd+n'],
      description: 'Create new item',
      category: 'Actions',
    },
  ]);

  const [showHelp, setShowHelp] = useState(false);

  const registerShortcut = useCallback((shortcut) => {
    setShortcuts((prev) => {
      const exists = prev.find((s) => s.id === shortcut.id);
      if (exists) {
        return prev.map((s) => (s.id === shortcut.id ? { ...s, ...shortcut } : s));
      }
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getShortcut = useCallback(
    (id) => {
      return shortcuts.find((s) => s.id === id);
    },
    [shortcuts]
  );

  const getShortcutsByCategory = useCallback(() => {
    const categories = {};
    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(shortcut);
    });
    return categories;
  }, [shortcuts]);

  const toggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const value = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    getShortcut,
    getShortcutsByCategory,
    showHelp,
    setShowHelp,
    toggleHelp,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};
