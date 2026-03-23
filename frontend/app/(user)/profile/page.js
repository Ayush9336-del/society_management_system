'use client';

import { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { User, Building2, Mail, Phone } from 'lucide-react';
import { getAuth } from '@/lib/auth';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth.user);
      setFormData({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile update functionality would be implemented here');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

          <div className="space-y-4 mb-6">
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
              <Building2 size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Flat Number</p>
                <p className="text-sm text-gray-600">{user?.flat_number || 'Not assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <Mail size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <Phone size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Profile</h2>

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              required
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(val) => setFormData({ ...formData, email: val })}
              disabled
            />

            <FormInput
              label="Phone"
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              placeholder="Enter phone number"
            />

            <button
              type="submit"
              className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
