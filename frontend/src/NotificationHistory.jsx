// src/NotificationHistory.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/notifications')
      .then(res => setNotifications(res.data.reverse())) // newest first
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">🕓 Notification History</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500">No notifications sent yet.</p>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">{n.type.toUpperCase()}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                n.status === 'success'
                  ? 'bg-green-100 text-green-700'
                  : n.status === 'queued'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {n.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">To: <span className="font-mono">{n.to}</span></p>
            <p className="text-sm mt-2 text-gray-800">{n.message}</p>
            <p className="text-xs mt-2 text-gray-400">{n.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
