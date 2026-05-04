import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { compOffAPI } from '../api/compOff';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ApplyCompOff = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dateWorked: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateWorked) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await compOffAPI.applyCompOff(formData);
      toast.success('Comp Off request submitted successfully');
      navigate('/compoff/my');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Request Comp Off</h1>
        <p className="text-dark-600 dark:text-slate-400 mt-1">
          Select a weekend or holiday date and provide a reason.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date picker */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.dateWorked}
              onChange={(e) => setFormData({ ...formData, dateWorked: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-400 dark:text-slate-500">
              You can select any past or upcoming holiday, Saturday, or Sunday.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white h-32 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Briefly explain why you are requesting comp off for this date..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyCompOff;
