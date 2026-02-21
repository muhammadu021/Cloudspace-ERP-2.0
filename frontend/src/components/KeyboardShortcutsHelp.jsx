import React from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { Modal } from '../design-system/components/Modal';

const KeyboardShortcutsHelp = () => {
  const { showHelp, setShowHelp, getShortcutsByCategory } = useKeyboardShortcuts();

  const categories = getShortcutsByCategory();

  const formatKeys = (keys) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.map((key, index) => (
      <span key={index}>
        {index > 0 && <span className="text-neutral-500 mx-2">or</span>}
        <kbd className="px-2 py-1 text-sm font-semibold text-neutral-800 bg-neutral-100 border border-neutral-300 rounded">
          {key.split('+').map((k, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">+</span>}
              <span className="capitalize">{k === 'cmd' ? '⌘' : k === 'ctrl' ? 'Ctrl' : k === 'shift' ? 'Shift' : k === 'alt' ? 'Alt' : k}</span>
            </span>
          ))}
        </kbd>
      </span>
    ));
  };

  return (
    <Modal
      open={showHelp}
      onClose={() => setShowHelp(false)}
      title="Keyboard Shortcuts"
      size="lg"
    >
      <div className="space-y-6">
        {Object.entries(categories).map(([category, shortcuts]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">{category}</h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0"
                >
                  <span className="text-neutral-700">{shortcut.description}</span>
                  <div className="flex items-center gap-2">
                    {formatKeys(shortcut.keys)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <p className="text-sm text-neutral-600">
          Press <kbd className="px-2 py-1 text-sm font-semibold text-neutral-800 bg-neutral-100 border border-neutral-300 rounded">?</kbd> to toggle this help dialog
        </p>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsHelp;
