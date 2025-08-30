import React, { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };
  
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false); // Schließe das Notifikationsmenü
    
    // Navigation basierend auf dem Benachrichtigungstyp
    if (notification.type === "survey" || notification.type === "new-survey") {
      navigate("/umfrage");
    } else if (notification.type === "reflection" || notification.type === "new-reflection") {
      navigate("/reflexion");
    }
  };
  
  const handleRemove = (e, notificationId) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-1 rounded-full hover:bg-gray-200 focus:outline-none"
        aria-label="Benachrichtigungen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="py-2 px-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium">Benachrichtigungen</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-4 px-3 text-sm text-gray-500 text-center">
                Keine Benachrichtigungen
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-start ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="py-2 px-3 text-center border-t border-gray-200">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Alle als gelesen markieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
