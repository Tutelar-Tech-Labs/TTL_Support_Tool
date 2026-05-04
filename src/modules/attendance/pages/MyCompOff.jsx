import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { compOffAPI } from '../api/compOff';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MyCompOff = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await compOffAPI.getMyCompOffRequests();
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to load your requests');
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">My Comp Off Requests</h1>
          <p className="text-dark-600 dark:text-slate-400 mt-1">
            Track your comp off requests. Approved requests add to your paid leave balance.
          </p>
        </div>
        <Button onClick={() => navigate('/compoff/apply')} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request Comp Off
        </Button>
      </div>

      <Card title="Request History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Date</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Reason</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Status</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Admin Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-slate-50 dark:hover:bg-servicenow-dark/50 transition-colors">
                  <td className="py-4 text-dark-600 dark:text-slate-300 whitespace-nowrap">
                    {format(new Date(request.dateWorked), 'EEE, MMM dd, yyyy')}
                  </td>
                  <td className="py-4">
                    <div className="max-w-xs text-dark-900 dark:text-white" title={request.reason}>
                      {request.reason}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-dark-500 dark:text-slate-400 italic">
                    {request.adminComment || '—'}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-dark-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MyCompOff;
