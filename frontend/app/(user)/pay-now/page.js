'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Building2, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

const PAYMENT_MODES = ['UPI', 'Net Banking', 'Cash', 'Cheque', 'NEFT/RTGS'];

export default function PayNowPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payingMonth, setPayingMonth] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/user/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  const handlePay = async (month) => {
    setLoading(true);
    setSuccess('');
    setError('');
    setPayingMonth(month);
    try {
      await api.post('/user/pay', { month, payment_mode: paymentMode });
      setSuccess(`Payment for ${month} recorded successfully.`);
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setPayingMonth(null);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBill = dashboardData?.current_bill;
  const user = dashboardData?.user;
  const pendingPayments = dashboardData?.pending_payments || [];
  const currentMonthPaid = currentBill?.status === 'paid';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pay Now</h1>

      <div className="max-w-2xl space-y-6">

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={18} /> {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={e => setPaymentMode(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

       
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Month — {currentMonth}</h2>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building2 size={20} className="text-accent" />
              <div>
                <p className="text-xs text-gray-500">Flat</p>
                <p className="font-semibold text-gray-900">{user?.flat_number} ({user?.flat_type})</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <CreditCard size={20} className="text-accent" />
              <div>
                <p className="text-xs text-gray-500">Amount Due</p>
                <p className="text-xl font-bold text-gray-900">₹{user?.monthly_amount}</p>
              </div>
            </div>
          </div>

          {currentMonthPaid ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
              <CheckCircle size={18} /> Paid on {new Date(currentBill.payment_date).toLocaleDateString()}
            </div>
          ) : (
            <button
              onClick={() => handlePay(currentMonth)}
              disabled={loading && payingMonth === currentMonth}
              className="w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-semibold disabled:opacity-50"
            >
              {loading && payingMonth === currentMonth ? 'Processing...' : `Pay ₹${user?.monthly_amount}`}
            </button>
          )}
        </div>

       
        {pendingPayments.filter(p => p.month !== currentMonth).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200">
            <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Clock size={18} /> Pending Payments
            </h2>
            <div className="space-y-3">
              {pendingPayments
                .filter(p => p.month !== currentMonth)
                .map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div>
                      <p className="font-medium text-gray-900">{payment.month}</p>
                      <p className="text-sm text-gray-500">₹{payment.amount}</p>
                    </div>
                    <button
                      onClick={() => handlePay(payment.month)}
                      disabled={loading && payingMonth === payment.month}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading && payingMonth === payment.month ? '...' : 'Pay Now'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
