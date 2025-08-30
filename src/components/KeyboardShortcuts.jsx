import React, { useState, useEffect } from 'react';

const KeyboardShortcuts = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Global keyboard listener for ? key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        // Only trigger if not in input fields
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setIsVisible(!isVisible);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const shortcuts = [
    { key: 'Strg + N', description: 'Neue News erstellen' },
    { key: 'Strg + R', description: 'News aktualisieren' },
    { key: 'Esc', description: 'Formular schließen' },
    { key: '?', description: 'Diese Hilfe anzeigen' }
  ];

  return (
    <>
      {/* Keyboard shortcut help button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Tastaturkürzel anzeigen (?)"
      >
        <span className="text-lg font-bold">?</span>
      </button>

      {/* Shortcuts modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tastaturkürzel
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                    {shortcut.key}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Drücken Sie "?" um diese Hilfe ein-/auszublenden
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
