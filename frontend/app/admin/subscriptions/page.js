'use client';

import { useState, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';
import api from '@/lib/api';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setEditAmount(sub.monthly_amount);
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/subscriptions/${id}`, { monthly_amount: editAmount });
      fetchSubscriptions();
      setEditingId(null);
    } catch (error) {
      alert('Failed to update subscription');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Flat Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Monthly Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {sub.flat_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingId === sub.id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  ) : (
                    `₹${sub.monthly_amount}`
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {editingId === sub.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(sub.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(sub)}
                      className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
