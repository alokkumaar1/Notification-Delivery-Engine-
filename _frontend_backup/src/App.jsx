import { useState } from 'react';
import './App.css';

function App() {
  const [type, setType] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipient, message })
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="container">
      <h1>📩 Send Notification</h1>
      <form onSubmit={handleSubmit}>
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push</option>
        </select>

        <label>Recipient:</label>
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />

        <label>Message:</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />

        <button type="submit">Send</button>
      </form>

      {response && (
        <div className="response">
          <h3>✅ Notification Queued</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
