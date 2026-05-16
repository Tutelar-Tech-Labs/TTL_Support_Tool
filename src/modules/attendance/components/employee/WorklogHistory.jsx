import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { employeeAPI } from '../../api/employee';
import Card from '../ui/Card';
import Button from '../ui/Button';
import 'react-datepicker/dist/react-datepicker.css';
import { Pencil, X, Save, Clock, AlertCircle } from 'lucide-react';

const WorklogHistory = ({ refreshTrigger }) => {
  const [worklogs, setWorklogs] = useState([]);
  const [filteredWorklogs, setFilteredWorklogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [editingLog, setEditingLog] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadWorklogs();
  }, [selectedMonth, refreshTrigger]);

  useEffect(() => {
    filterWorklogs();
  }, [worklogs, searchQuery]);

  const loadWorklogs = async () => {
    setIsLoading(true);
    try {
      const monthStr = format(selectedMonth, 'yyyy-MM');
      const fromDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const toDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      
      const response = await employeeAPI.getWorklogsByRange(fromDate, toDate);
      setWorklogs(response.data.worklogs);
    } catch (error) {
      console.error('Failed to load worklogs:', error);
      setWorklogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWorklogs = () => {
    if (!searchQuery.trim()) {
      setFilteredWorklogs(worklogs);
      return;
    }

    const filtered = worklogs.filter((log) =>
      log.activity.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWorklogs(filtered);
  };

  const totalHours = filteredWorklogs.reduce((sum, log) => sum + log.durationMinutes, 0) / 60;

  const getISTDateString = (date = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset).toISOString().split('T')[0];
  };

  const isToday = (dateStr) => {
    const todayStr = getISTDateString();
    // dateStr from backend is already in YYYY-MM-DD format
    return todayStr === dateStr;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Basic time validation
      const [h1, m1] = editingLog.fromTime.split(':').map(Number);
      const [h2, m2] = editingLog.toTime.split(':').map(Number);
      if (h2 * 60 + m2 <= h1 * 60 + m1) {
        toast.error("End time must be after start time");
        return;
      }

      await employeeAPI.updateWorklog(editingLog._id, editingLog);
      toast.success("Worklog updated successfully!");
      setEditingLog(null);
      loadWorklogs();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update worklog");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white">Worklog History</h2>
        <div className="text-right">
          <p className="text-sm text-dark-600 dark:text-slate-300">Total Hours</p>
          <p className="text-2xl font-bold text-primary-600">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label-premium">Filter by Month</label>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="input-premium"
          />
        </div>
        <div>
          <label className="label-premium">Search Activity</label>
          <input
            type="text"
            placeholder="Search in activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredWorklogs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-dark-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-dark-600 dark:text-slate-300">No worklogs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-dark-200 dark:border-slate-700">
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Date</th>
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Time</th>
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Duration</th>
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Customer</th>
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Ticket</th>
                <th className="text-left p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Activity</th>
                <th className="text-center p-3 text-sm font-semibold text-dark-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorklogs.map((log, index) => (
                <tr
                  key={log._id}
                  className={`border-b border-dark-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-servicenow transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-servicenow-light' : 'bg-dark-50 dark:bg-servicenow-dark'
                  }`}
                >
                  <td className="p-3 text-sm text-dark-900 dark:text-slate-200">
                    {format(new Date(log.date), 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 text-sm text-dark-700 dark:text-slate-300">
                    {log.fromTime} - {log.toTime}
                  </td>
                  <td className="p-3 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m
                  </td>
                  <td className="p-3 text-sm text-dark-700 dark:text-slate-300">
                    {log.customerName || '-'}
                  </td>
                  <td className="p-3 text-sm text-dark-700 dark:text-slate-300 font-mono">
                    {log.ticketId || '-'}
                  </td>
                  <td className="p-3 text-sm text-dark-700 dark:text-slate-300 max-w-md">
                    {log.activity}
                  </td>
                  <td className="p-3 text-center">
                    {isToday(log.date) ? (
                      <button
                        onClick={() => setEditingLog({ ...log })}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-500">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-servicenow-light rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 dark:border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-primary-600 to-accent-600">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Worklog
              </h3>
              <button onClick={() => setEditingLog(null)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-premium">From Time</label>
                  <input
                    type="time"
                    className="input-premium"
                    value={editingLog.fromTime}
                    onChange={(e) => setEditingLog({ ...editingLog, fromTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-premium">To Time</label>
                  <input
                    type="time"
                    className="input-premium"
                    value={editingLog.toTime}
                    onChange={(e) => setEditingLog({ ...editingLog, toTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-premium">Customer</label>
                  <input
                    type="text"
                    className="input-premium"
                    value={editingLog.customerName || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-premium">Ticket ID</label>
                  <input
                    type="text"
                    className="input-premium"
                    value={editingLog.ticketId || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, ticketId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label-premium">Activity</label>
                <textarea
                  className="input-premium resize-none h-32"
                  value={editingLog.activity}
                  onChange={(e) => setEditingLog({ ...editingLog, activity: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditingLog(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WorklogHistory;
