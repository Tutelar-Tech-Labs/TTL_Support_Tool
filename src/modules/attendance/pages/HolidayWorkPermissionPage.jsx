import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { holidayPermissionAPI } from '../api/holidayWorkPermission';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const HolidayWorkPermissionPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    holidayDate: '',
    reason: ''
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await holidayPermissionAPI.getMyPermissions();
      setPermissions(response.data.permissions);
    } catch (error) {
      toast.error('Failed to load permission requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await holidayPermissionAPI.applyPermission(formData);
      toast.success('Permission request submitted successfully');
      setIsModalOpen(false);
      setFormData({ holidayDate: '', reason: '' });
      loadPermissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Holiday Work Permission</h1>
          <p className="text-dark-600 dark:text-slate-400">Request permission to work on a holiday</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request Permission
        </Button>
      </div>

      <Card title="My Permission Requests">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Holiday Date</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Reason</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Status</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Admin Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-servicenow-dark/50 transition-colors">
                  <td className="py-4 text-dark-600 dark:text-slate-300">
                    {format(new Date(p.holidayDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-4 text-dark-900 dark:text-white">{p.reason}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 text-dark-600 dark:text-slate-300 text-sm">
                    {p.adminComment || '-'}
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-dark-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-servicenow-light rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Request Holiday Work Permission</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Holiday Date"
                type="date"
                required
                value={formData.holidayDate}
                onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="space-y-1">
                <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">Reason for Working</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white h-32"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why you need to work on this holiday..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayWorkPermissionPage;
