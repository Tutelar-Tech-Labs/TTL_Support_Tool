import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { holidayAPI } from '../api/holiday';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminHolidayPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'National',
    location: 'All',
    department: 'All',
    description: ''
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const response = await holidayAPI.getHolidays();
      setHolidays(response.data.holidays);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        title: holiday.title,
        date: holiday.date,
        type: holiday.type,
        location: holiday.location,
        department: holiday.department,
        description: holiday.description || ''
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        title: '',
        date: '',
        type: 'National',
        location: 'All',
        department: 'All',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await holidayAPI.updateHoliday(editingHoliday._id, formData);
        toast.success('Holiday updated successfully');
      } else {
        await holidayAPI.createHoliday(formData);
        toast.success('Holiday created successfully');
      }
      setIsModalOpen(false);
      loadHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save holiday');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await holidayAPI.deleteHoliday(id);
        toast.success('Holiday deleted successfully');
        loadHolidays();
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Holiday Management</h1>
          <p className="text-dark-600 dark:text-slate-400">Add and manage company holidays</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Holiday
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Holiday</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Date</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Type</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {holidays.map((holiday) => (
                <tr key={holiday._id} className="hover:bg-slate-50 dark:hover:bg-servicenow-dark/50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-dark-900 dark:text-white">{holiday.title}</div>
                    <div className="text-xs text-dark-500 dark:text-slate-500">{holiday.description}</div>
                  </td>
                  <td className="py-4 text-dark-600 dark:text-slate-300">
                    {format(new Date(holiday.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      holiday.type === 'National' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      holiday.type === 'Regional' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {holiday.type}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleOpenModal(holiday)}
                        className="p-1 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(holiday._id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-dark-500">No holidays found.</td>
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
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Holiday Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Independence Day"
              />
              <Input
                label="Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">Holiday Type</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="National">National</option>
                  <option value="Regional">Regional</option>
                  <option value="Company">Company</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingHoliday ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHolidayPage;
