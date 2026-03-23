'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import { Building2, IndianRupee, AlertCircle, TrendingUp, Users } from 'lucide-react';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [monthStatus, setMonthStatus] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.dashboard);
      setRecentPayments(res.data.recent_payments || []);
      setMonthlyTrend(res.data.monthly_trend || []);
      setPaymentModes(res.data.payment_modes || []);
      setMonthStatus(res.data.current_month_status || null);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const paidUnpaidData = monthStatus
    ? [
        { name: 'Paid', value: Number(monthStatus.paid) },
        { name: 'Unpaid', value: Number(monthStatus.unpaid) },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Flats"       value={stats?.total_flats || '0'}            icon={Building2}    color="blue" />
        <StatCard title="Residents"         value={stats?.total_residents || '0'}         icon={Users}        color="accent" />
        <StatCard title="Total Collected"   value={fmt(stats?.total_collected)}           icon={IndianRupee}  color="green" />
        <StatCard title="This Month"        value={fmt(stats?.monthly_revenue)}           icon={TrendingUp}   color="accent" />
        <StatCard title="Pending (Month)"   value={fmt(stats?.pending_amount)}            icon={AlertCircle}  color="red" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

         <div className="lg:col-span-2">
          <ChartCard title="Monthly Collection (Last 6 Months)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collected']} />
                <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

         <ChartCard title="This Month — Paid vs Unpaid">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paidUnpaidData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                {paidUnpaidData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#22c55e' : '#f87171'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <ChartCard title="Payment Modes">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentModes} dataKey="count" nameKey="payment_mode"
                cx="50%" cy="50%" outerRadius={75} label={({ payment_mode, count }) => `${payment_mode}: ${count}`}>
                {paymentModes.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v, n, p) => [v, p.payload.payment_mode]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

         <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Recent Payments</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Flat', 'Resident', 'Month', 'Amount', 'Mode'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No payments yet</td></tr>
                ) : (
                  recentPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{p.flat_number}</td>
                      <td className="px-4 py-2 text-gray-700">{p.resident_name || '—'}</td>
                      <td className="px-4 py-2 text-gray-700">{p.month}</td>
                      <td className="px-4 py-2 text-gray-700">{fmt(p.amount)}</td>
                      <td className="px-4 py-2 text-gray-500">{p.payment_mode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
