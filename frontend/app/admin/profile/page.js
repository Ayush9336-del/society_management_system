'use client';

import { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { User, Shield, Clock } from 'lucide-react';
import { getAuth } from '@/lib/auth';

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth.user);
    }
  }, []);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }
    alert('Password change functionality would be implemented here');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Shield size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Role</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <Clock size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Login</p>
                <p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

          <form onSubmit={handlePasswordChange}>
            <FormInput
              label="Current Password"
              type="password"
              value={passwordData.current}
              onChange={(val) => setPasswordData({ ...passwordData, current: val })}
              required
            />

            <FormInput
              label="New Password"
              type="password"
              value={passwordData.new}
              onChange={(val) => setPasswordData({ ...passwordData, new: val })}
              required
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              value={passwordData.confirm}
              onChange={(val) => setPasswordData({ ...passwordData, confirm: val })}
              required
            />

            <button
              type="submit"
              className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
