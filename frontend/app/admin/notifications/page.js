'use client';

import { useState, useEffect } from 'react';
import { Send, Bell, Download } from 'lucide-react';
import api from '@/lib/api';

export default function NotificationsPage() {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [residents, setResidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchResidents();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchResidents = async () => {
    try {
      const res = await api.get('/admin/residents');
      setResidents((res.data.residents || []).filter(r => r.role === 'user'));
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      await api.post('/admin/notifications', {
        message,
        user_id: userId || null,
      });
      setSuccess('Notification sent!');
      setMessage('');
      setUserId('');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification');
    }
  };

  const downloadSingle = (notif) => {
    const content = [
      'NOTIFICATION',
      '============',
      `ID:        ${notif.id}`,
      `To:        ${notif.recipient_name ? `${notif.recipient_name} (${notif.recipient_email})` : 'All Residents'}`,
      `Message:   ${notif.message}`,
      `Sent At:   ${new Date(notif.created_at).toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification_${notif.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Send form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Send Notification</h2>

          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}
          {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <select value={userId} onChange={e => setUserId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">All Residents</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.flat_number || 'No flat'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                placeholder="Enter notification message..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-sm">
              <Send size={16} /> Send
            </button>
          </form>
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                    <Bell size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      To: {notif.recipient_name ? `${notif.recipient_name}` : 'All Residents'}
                      {' · '}{new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => downloadSingle(notif)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg shrink-0" title="Download">
                    <Download size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
