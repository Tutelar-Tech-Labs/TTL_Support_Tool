import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { compOffAPI } from '../api/compOff';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminCompOffPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await compOffAPI.getAllCompOffRequests();
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedRequest) return;
    try {
      await compOffAPI.reviewCompOffRequest(selectedRequest._id, { status, adminComment });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setSelectedRequest(null);
      setAdminComment('');
      loadRequests();
    } catch (error) {
      toast.error('Failed to review request');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Comp Off Approvals</h1>
        <p className="text-dark-600 dark:text-slate-400">Review and manage employee compensatory leave requests</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Employee</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Date Worked</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Reason</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Status</th>
                <th className="pb-4 font-semibold text-dark-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-slate-50 dark:hover:bg-servicenow-dark/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {request.userId.profilePicture ? (
                        <img src={request.userId.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                          {request.userId.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-dark-900 dark:text-white">{request.userId.fullName}</div>
                        <div className="text-xs text-dark-500 dark:text-slate-500">{request.userId.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-dark-600 dark:text-slate-300">
                    {format(new Date(request.dateWorked), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-4">
                    <div className="max-w-xs truncate text-dark-900 dark:text-white" title={request.reason}>
                      {request.reason}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {request.status === 'Pending' ? (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-dark-400">{format(new Date(request.reviewedAt), 'MMM dd')}</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-dark-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-servicenow-light rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Review Comp Off Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-dark-500 dark:text-slate-400">Employee</div>
                <div className="font-semibold text-dark-900 dark:text-white">{selectedRequest.userId.fullName}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-dark-500 dark:text-slate-400">Date Worked</div>
                <div className="font-semibold text-dark-900 dark:text-white">
                  {format(new Date(selectedRequest.dateWorked), 'EEEE, MMMM do, yyyy')}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-dark-500 dark:text-slate-400">Reason</div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-servicenow-dark text-sm text-dark-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  {selectedRequest.reason}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">Admin Comment (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white h-24"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Reason for approval or rejection..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => handleReview('Rejected')} className="flex-1">
                  Reject
                </Button>
                <Button onClick={() => handleReview('Approved')} className="flex-1">
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompOffPage;
