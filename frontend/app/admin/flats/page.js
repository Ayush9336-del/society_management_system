'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import { Plus, Edit, DoorOpen, UserPlus, UserCheck } from 'lucide-react';
import api from '@/lib/api';

const FLAT_TYPES = [
  { value: '1BHK', label: '1BHK' },
  { value: '2BHK', label: '2BHK' },
  { value: '3BHK', label: '3BHK' },
  { value: '4BHK', label: '4BHK' },
];

const TYPE_COLORS = {
  '1BHK': 'bg-blue-100 text-blue-700',
  '2BHK': 'bg-purple-100 text-purple-700',
  '3BHK': 'bg-orange-100 text-orange-700',
  '4BHK': 'bg-pink-100 text-pink-700',
};

const emptyForm = { flat_number: '', flat_type: '' };
const emptyUserForm = { name: '', email: '', phone: '', role: 'user' };

export default function FlatsPage() {
  const [flats, setFlats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null); // null = create, id = edit
  const [assigningFlat, setAssigningFlat] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userError, setUserError] = useState('');

  useEffect(() => { fetchFlats(); }, []);

  useEffect(() => {
    let result = flats;
    if (search) {
      result = result.filter(f =>
        f.flat_number.toLowerCase().includes(search.toLowerCase()) ||
        (f.resident_name && f.resident_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (filterType !== 'all') result = result.filter(f => f.flat_type === filterType);
    if (filterStatus === 'assigned') result = result.filter(f => f.is_assigned);
    else if (filterStatus === 'vacant') result = result.filter(f => !f.is_assigned);
    setFiltered(result);
    setCurrentPage(1);
  }, [flats, search, filterType, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const fetchFlats = async () => {
    try {
      const res = await api.get('/flats');
      setFlats(res.data.flats || []);
    } catch (err) {
      console.error('Failed to fetch flats:', err);
    }
  };

  const fetchUnassignedUsers = async () => {
    try {
      const res = await api.get('/admin/residents');
      setUnassignedUsers((res.data.residents || []).filter(u => !u.flat_id));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Add/Edit flat
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFlat) {
        await api.put(`/flats/${editingFlat.id}`, formData);
      } else {
        await api.post('/flats', formData);
      }
      fetchFlats();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.patch(`/flats/${assigningFlat.id}/assign`, { user_id: selectedUserId });
      fetchFlats();
      setIsAssignModalOpen(false);
      setAssigningFlat(null);
      setSelectedUserId('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign resident');
    }
  };

  const handleVacate = async (id) => {
    if (!confirm('Vacate this flat? The resident will be unlinked but all payment history is preserved.')) return;
    try {
      await api.patch(`/flats/${id}/vacate`);
      fetchFlats();
    } catch (err) {
      alert('Failed to vacate flat');
    }
  };

  // Create or update resident
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    try {
      if (editingUserId) {
        await api.patch(`/admin/residents/${editingUserId}`, userForm);
      } else {
        await api.post('/admin/residents', userForm);
      }
      setIsUserModalOpen(false);
      setUserForm(emptyUserForm);
      setEditingUserId(null);
      fetchFlats();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Failed to save resident');
    }
  };

  const openAssignModal = (flat) => {
    setAssigningFlat(flat);
    setSelectedUserId('');
    fetchUnassignedUsers();
    setIsAssignModalOpen(true);
  };

  const openModal = (flat = null) => {
    setEditingFlat(flat);
    setFormData(flat ? { flat_number: flat.flat_number, flat_type: flat.flat_type } : emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingFlat(null); };

  // Open user modal in CREATE mode
  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserError('');
    setIsUserModalOpen(true);
  };

  // Open user modal in EDIT mode — pre-fill with resident's current data
  const openEditUser = (flat) => {
    setEditingUserId(flat.resident_id);
    setUserForm({
      name: flat.resident_name || '',
      email: flat.resident_email || '',
      phone: flat.resident_phone || '',
      role: flat.resident_role || 'user',
    });
    setUserError('');
    setIsUserModalOpen(true);
  };

  const total = flats.length;
  const assigned = flats.filter(f => f.is_assigned).length;
  const vacant = total - assigned;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flats</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total · {assigned} assigned · {vacant} vacant</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <UserCheck size={18} /> Add Resident
          </button>
          <button onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm font-medium">
            <Plus size={18} /> Add Flat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total Flats</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-700">{assigned}</p>
          <p className="text-sm text-green-600">Assigned</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-orange-700">{vacant}</p>
          <p className="text-sm text-orange-600">Vacant</p>
        </div>
      </div>

      <div className="bg-white text-gray-800 rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Search flat or resident..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="all">All Types</option>
          {FLAT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="vacant">Vacant</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Flat No.', 'Type', 'Status', 'Resident', 'Email', 'Phone', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map(flat => (
              <tr key={flat.flat_number} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{flat.flat_number}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[flat.flat_type]}`}>
                    {flat.flat_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flat.is_assigned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {flat.is_assigned ? 'Assigned' : 'Vacant'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{flat.resident_name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{flat.resident_email || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{flat.resident_phone || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEditUser(flat)}
                      className="p-1.5 text-blue-600 cursor-pointer rounded-lg hover:bg-blue-50" title="Edit resident">
                      <Edit size={14} />
                    </button>
                    {!flat.is_assigned && (
                      <button onClick={() => openAssignModal(flat)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Assign resident">
                        <UserPlus size={14} />
                      </button>
                    )}
                    {flat.is_assigned && (
                      <button onClick={() => handleVacate(flat.id)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg" title="Vacate flat">
                        <DoorOpen size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No flats found</div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>{filtered.length} results · Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    page === currentPage
                      ? 'bg-accent text-white border-accent'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Flat Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFlat ? 'Edit Flat' : 'Add Flat'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Flat Number" value={formData.flat_number}
            onChange={v => setFormData({ ...formData, flat_number: v })} required />
          <FormInput label="Flat Type" type="select" value={formData.flat_type}
            onChange={v => setFormData({ ...formData, flat_type: v })}
            options={FLAT_TYPES} required />
          <button type="submit"
            className="w-full py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium mt-2">
            {editingFlat ? 'Update Flat' : 'Create Flat'}
          </button>
        </form>
      </Modal>

      {/* Assign Resident Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Resident — ${assigningFlat?.flat_number}`}>
        <form onSubmit={handleAssign}>
          {unassignedUsers.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">
              No unassigned residents found. Add a resident first using "Add Resident".
            </p>
          ) : (
            <FormInput label="Select Resident" type="select" value={selectedUserId}
              onChange={v => setSelectedUserId(v)}
              options={unassignedUsers.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
              required />
          )}
          <button type="submit" disabled={unassignedUsers.length === 0}
            className="w-full py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium mt-2 disabled:opacity-50">
            Assign
          </button>
        </form>
      </Modal>

      {/* Create / Edit Resident Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => { setIsUserModalOpen(false); setEditingUserId(null); }}
        title={editingUserId ? 'Edit Resident' : 'Add New Resident'}>
        <form onSubmit={handleUserSubmit}>
          {userError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{userError}</div>
          )}
          <FormInput label="Full Name" value={userForm.name}
            onChange={v => setUserForm({ ...userForm, name: v })} required />
          <FormInput label="Email" type="email" value={userForm.email}
            onChange={v => setUserForm({ ...userForm, email: v })} required />
          <FormInput label="Phone" value={userForm.phone}
            onChange={v => setUserForm({ ...userForm, phone: v })} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="user">Resident</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!editingUserId && (
            <p className="text-xs text-gray-400 mb-3">
              The resident can log in using their Google account with this email. Flat can be assigned after creation.
            </p>
          )}
          <button type="submit"
            className="w-full py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium">
            {editingUserId ? 'Save Changes' : 'Create Resident'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
