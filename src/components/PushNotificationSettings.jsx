import React, { useState, useEffect } from 'react';
import { 
  isPushSupported, 
  requestNotificationPermission
} from '../utils/pushNotifications';

const PushNotificationSettings = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isPushSupported());
    
    // Aktuelle Berechtigung prüfen
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          ❌ Push-Benachrichtigungen nicht unterstützt
        </h3>
        <p className="text-red-700 dark:text-red-300">
          Ihr Browser/Gerät unterstützt keine Push-Benachrichtigungen.
          {' '}Versuchen Sie es mit einem anderen Browser oder stellen Sie sicher, 
          dass Sie die neueste Version verwenden.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔔 Push-Benachrichtigungen
      </h3>
      
      <div className="space-y-4">
        {/* Status Anzeige */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {notificationPermission === 'granted' && '✅ Aktiviert'}
              {notificationPermission === 'denied' && '❌ Deaktiviert'}
              {notificationPermission === 'default' && '⏳ Nicht festgelegt'}
            </p>
          </div>
          
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Aktivieren
            </button>
          )}
        </div>

        {/* Beschreibung */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Wann erhalten Sie Benachrichtigungen?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>📰 Bei neuen News-Artikeln</li>
            <li>📋 Bei neuen Umfragen</li>
          </ul>
          <p className="mt-3 text-xs">
            <em>
              Hinweis: Push-Benachrichtigungen sind primär für Spieler gedacht, 
              um über wichtige Updates informiert zu werden.
            </em>
          </p>
        </div>

        {/* Test Buttons */}
        {notificationPermission === 'granted' && (
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              ✅ Push-Benachrichtigungen sind aktiviert
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sie erhalten automatisch Benachrichtigungen bei neuen News und Umfragen.
            </p>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p>
              <strong>Benachrichtigungen wurden deaktiviert.</strong>
            </p>
            <p className="mt-1">
              Um sie zu aktivieren, gehen Sie in Ihre Browser-Einstellungen und erlauben Sie 
              Benachrichtigungen für diese Website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationSettings;
