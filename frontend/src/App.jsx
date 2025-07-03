import { useState, useEffect } from 'react';
import axios from 'axios';
import { registerForPush } from './NotificationSetup';

export default function App() {
  const [tab, setTab] = useState('send');
  const [type, setType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('⏳ Sending notification...');

    try {
      let finalRecipient = recipient;

      if (type === 'push') {
        const token = await registerForPush((payload) => {
          alert(`🔔 ${payload?.notification?.title || 'Push Notification'}\n${payload?.notification?.body || ''}`);
        });

        if (!token) {
          setStatus('❌ Notification permission denied');
          return;
        }

        finalRecipient = token;
      }

      const response = await axios.post('http://localhost:8000/notify', {
        type,
        recipient: finalRecipient,
        message,
      });

      setStatus(`✅ Notification queued to ${response.data.recipient} (${response.data.type})`);
      setType('');
      setRecipient('');
      setMessage('');
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to send notification');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:8000/notifications');
      setNotifications(res.data.reverse());
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (tab === 'history') {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 4000);
    }
    return () => clearInterval(interval);
  }, [tab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-white p-6 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">📣 Notification Engine</h1>
        <p className="text-gray-600 mt-2">Send & track system notifications in real-time</p>
      </header>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setTab('send')}
          className={`px-6 py-2 rounded-full font-medium ${
            tab === 'send'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-indigo-600 border border-indigo-300'
          } transition`}
        >
          🚀 Send Notification
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-6 py-2 rounded-full font-medium ${
            tab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-indigo-600 border border-indigo-300'
          } transition`}
        >
          🕒 Notification History
        </button>
      </div>

      {tab === 'send' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              >
                <option value="">Select Type</option>
                <option value="email">📧 Email</option>
                <option value="sms">📱 SMS</option>
                <option value="push">🔔 Push</option>
              </select>
            </div>

            {type !== 'push' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. krisha@example.com or +91xxxxxxxxxx"
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                rows="4"
                placeholder="Enter your message"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition"
            >
              🚀 Send Notification
            </button>
          </form>

          {status && (
            <div className="mt-6 p-4 rounded-xl text-sm text-center bg-indigo-50 text-indigo-700 font-medium shadow-inner break-words whitespace-pre-wrap overflow-x-auto">
              {status}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-600">🕒 Notification History</h2>
            <button
              onClick={fetchNotifications}
              className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition"
            >
              🔄 Refresh
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li key={n.id} className="py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 break-words overflow-hidden">
                      <p className="font-medium text-gray-800 break-words overflow-x-auto">
                        {n.type.toUpperCase()} to {n.to}
                      </p>
                      <p className="text-sm text-gray-600 break-words whitespace-pre-wrap overflow-x-auto">{n.message}</p>
                    </div>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        n.status.startsWith('SUCCESS')
                          ? 'bg-green-100 text-green-800'
                          : n.status.startsWith('FAILED')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
