import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { holidayAPI } from '../api/holiday';
import Card from '../components/ui/Card';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    loadHolidays();
  }, [yearFilter]);

  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      const response = await holidayAPI.getHolidays(yearFilter);
      setHolidays(response.data.holidays);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'National':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Regional':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Company':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    years.push(y);
  }

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
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Holiday Calendar</h1>
          <p className="text-dark-600 dark:text-slate-400">View upcoming and past holidays</p>
        </div>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {sortedHolidays.length > 0 ? (
        <Card title={`${yearFilter} Holiday List`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-4 font-semibold text-dark-900 dark:text-white">Date</th>
                  <th className="pb-4 font-semibold text-dark-900 dark:text-white">Holiday</th>
                  <th className="pb-4 font-semibold text-dark-900 dark:text-white">Type</th>
                  <th className="pb-4 font-semibold text-dark-900 dark:text-white">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedHolidays.map((holiday) => {
                  const isPast = new Date(holiday.date) < new Date().setHours(0, 0, 0, 0);
                  return (
                    <tr key={holiday._id} className={`hover:bg-slate-50 dark:hover:bg-servicenow-dark/50 transition-colors ${isPast ? 'opacity-50' : ''}`}>
                      <td className="py-4 text-dark-600 dark:text-slate-300">
                        {format(new Date(holiday.date), 'EEEE, MMM dd, yyyy')}
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-dark-900 dark:text-white">{holiday.title}</div>
                        {holiday.description && (
                          <div className="text-sm text-dark-500 dark:text-slate-500">{holiday.description}</div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(holiday.type)}`}>
                          {holiday.type}
                        </span>
                      </td>
                      <td className="py-4 text-dark-600 dark:text-slate-300">{holiday.location || 'All'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8 text-dark-500">No holidays found for the selected year.</div>
        </Card>
      )}

      <Card title="Legend" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-dark-700 dark:text-slate-300">National Holiday</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-amber-500"></div>
            <span className="text-sm text-dark-700 dark:text-slate-300">Regional Holiday</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-dark-700 dark:text-slate-300">Company Holiday</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HolidayCalendar;