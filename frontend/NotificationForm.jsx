import { useState } from 'react'

export default function NotificationForm() {
  const [type, setType] = useState('email')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const res = await fetch('http://localhost:8000/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, recipient, message }),
      })
      if (res.ok) {
        setStatus('✅ Notification sent!')
      } else {
        setStatus('❌ Failed to send notification')
      }
    } catch (err) {
      setStatus('❌ Error connecting to server')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">Send Notification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push</option>
        </select>
        <input
          type="text"
          placeholder="Recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Send
        </button>
      </form>
      {status && <p className="text-center text-sm">{status}</p>}
    </div>
  )
}
