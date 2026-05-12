import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { employeeAPI } from '../api/employee';
import HeaderCard from '../components/employee/HeaderCard';
import PunchClockCard from '../components/employee/PunchClockCard';
import WeeklyWorkChart from '../components/employee/WeeklyWorkChart';
import WorklogForm from '../components/employee/WorklogForm';
import CalendarView from '../components/employee/CalendarView';
import WorklogHistory from '../components/employee/WorklogHistory';
import RegularizationForm from '../components/employee/RegularizationForm';
import Button from '../components/ui/Button';

// ── Missed Record Alert Banner ───────────────────────────────────────────────
const MissedRecordAlert = ({ alerts, onDismiss }) => {
  if (!alerts) return null;
  const { missedAttendance, missedWorklog, previousWorkingDay } = alerts;
  if (!missedAttendance && !missedWorklog) return null;

  const dayLabel = previousWorkingDay
    ? format(parseISO(previousWorkingDay), 'EEEE, MMM d yyyy')
    : 'the previous working day';

  const messages = [];
  if (missedAttendance) messages.push('attendance');
  if (missedWorklog) messages.push('worklog');
  const what = messages.join(' and ');

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 shadow-sm">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mt-0.5">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-0.5">
            You missed your {what} for {dayLabel}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {missedAttendance && 'Please mark your attendance. '}
            {missedWorklog && 'Please add your worklog entries. '}
            Use the <strong>Daily Entry</strong> tab to update your records.
          </p>

          {/* Pill badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {missedAttendance && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Attendance Missing
              </span>
            )}
            {missedWorklog && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Worklog Missing
              </span>
            )}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'calendar', 'history', 'regularize'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [myAlerts, setMyAlerts] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await employeeAPI.getMyAlerts();
      if (res.success) setMyAlerts(res.data);
    } catch {
      // Silent — alerts are non-critical
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-servicenow-dark dark:to-servicenow-dark p-6">
      
      <div className="max-w-6xl mx-auto">

        <HeaderCard user={user} />

        {/* Missed Record Alert */}
        {!alertDismissed && (
          <MissedRecordAlert
            alerts={myAlerts}
            onDismiss={() => setAlertDismissed(true)}
          />
        )}

        {/* Punch Clock & Weekly Chart — Always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PunchClockCard 
            onPunchUpdate={handleRefresh} 
            refreshTrigger={refreshTrigger}
          />
          <WeeklyWorkChart refreshTrigger={refreshTrigger} />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 sticky top-4 z-20 bg-white/80 dark:bg-servicenow-light/80 p-2 rounded-xl backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'daily'
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : 'text-dark-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-servicenow'
            }`}
          >
            Daily Entry
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'calendar'
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : 'text-dark-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-servicenow'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : 'text-dark-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-servicenow'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('regularize')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'regularize'
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : 'text-dark-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-servicenow'
            }`}
          >
            Regularize
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'daily' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <WorklogForm onSuccess={handleRefresh} />
              </div>
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-servicenow-light p-6 rounded-2xl shadow-premium border border-dark-100 dark:border-servicenow-dark sticky top-24">
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
                  <Button 
                    variant="secondary" 
                    className="w-full mb-3 flex items-center justify-center gap-2"
                    onClick={handleRefresh}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </Button>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 mt-6 sticky top-64">
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">Tips</h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-2 list-disc pl-4">
                    <li>Punch in to start tracking your work hours</li>
                    <li>Add worklogs with accurate time ranges</li>
                    <li>Worklogs cannot overlap in time</li>
                    <li>Punch out when you're done for the day</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'history' && (
            <WorklogHistory refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'regularize' && (
            <RegularizationForm refreshTrigger={refreshTrigger} onSuccess={handleRefresh} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

