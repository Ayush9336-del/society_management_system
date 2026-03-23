'use client';

import { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import api from '@/lib/api';

export default function PaymentEntryPage() {
  const [flats, setFlats] = useState([]);
  const [formData, setFormData] = useState({
    flat_id: '',
    month: new Date().toISOString().slice(0, 7),
    amount: '',
    payment_mode: '',
  });
  const [alreadyPaidcheck, setAlreadyPaidCheck] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // console.log('i am here  ')
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      const response = await api.get('/flats');
      setFlats(response.data.flats );
      // console.log(response.data) 


    } catch (error) {
      console.error('Failed to fetch flats:', error);
    }
  };

  const checkExistingPayment = async (flat_id, month) => {
    if (!flat_id || !month) return;

    try {


      const response = await api.get(`/payments?month=${month}`);
      const payments = response.data.payments ;


      const exists = payments.some((p) => p.flat_id === flat_id && p.status === 'paid');
      
      setAlreadyPaidCheck(exists);
    } 
    catch(e) {
      // console.log(e)  
      setAlreadyPaidCheck(false);
    }
  };

  const handleFlatOrMonthChange = (updated) => {
    setFormData(updated);
    setAlreadyPaidCheck(false);
    // console.log('done ' ) 

    
    checkExistingPayment(updated.flat_id, updated.month);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await api.post('/payments/manual', formData);
      setSuccess('Payment recorded successfully!');
      setFormData({
        flat_id: '',
        month: new Date().toISOString().slice(0, 7),
        amount: '',
        payment_mode: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manual Payment Entry</h1>

      <div className="max-w-2xl bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {alreadyPaidcheck && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Payment for this flat and month has already been recorded.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Select Flat"
            type="select"
            value={formData.flat_id}  
            onChange={(val) => handleFlatOrMonthChange({ ...formData, flat_id: val })}
            options={flats.map((flat) => ({
              value: flat.id,
              label: `${flat.flat_number} - ${flat.name}`,
            }))}
            required
          />

          <FormInput
            label="Month"
            type="month"
            value={formData.month}
            onChange={(val) => handleFlatOrMonthChange({ ...formData, month: val })}
            required
          />

          <FormInput
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(val) => setFormData({ ...formData, amount: val })}
            placeholder="Enter amount"
            required
          />

          <FormInput
            label="Payment Mode"
            type="select"
            value={formData.payment_mode}
            onChange={(val) => setFormData({ ...formData, payment_mode: val })}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
            required
          />

          <button
            type="submit"
            disabled={alreadyPaidcheck}
            className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}
