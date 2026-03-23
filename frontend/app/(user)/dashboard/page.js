'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import PaymentCard from '@/components/PaymentCard';
import { DollarSign, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import api from '@/lib/api';

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/user/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {dashboardData?.user && (
        <div className="mb-6 p-6 bg-gradient-to-r from-primary to-accent rounded-xl text-white">
          <h2 className="text-xl font-semibold mb-2">Welcome, {dashboardData.user.name}!</h2>
          <p className="text-white/90">Flat: {dashboardData.user.flat_number}</p>
          <p className="text-white/90">Type: {dashboardData.user.flat_type}</p>
          <p className="text-white/90">Monthly Amount: ₹{dashboardData.user.monthly_amount}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Current Month Bill"
          value={`₹${dashboardData?.current_bill?.amount || '0'}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Payment Status"
          value={dashboardData?.current_bill?.status === 'paid' ? 'Paid' : 'Pending'}
          icon={CheckCircle}
          color={dashboardData?.current_bill?.status === 'paid' ? 'green' : 'red'}
        />
        <StatCard
          title="Pending Payments"
          value={dashboardData?.pending_payments?.length || '0'}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-4">
            {dashboardData?.payment_history?.slice(0, 3).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">No notifications</p>
            ) : notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Bell size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
