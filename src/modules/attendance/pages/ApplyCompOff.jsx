import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { compOffAPI } from '../api/compOff';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// ── Analog Clock Time Picker (same as WorklogForm) ───────────────────────────
const AnalogTimePicker = ({ value, onChange, onClose }) => {
  const [mode, setMode] = useState('hours');
  const [period, setPeriod] = useState('AM');
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (value) {
      const [hStr, mStr] = value.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      let p = 'AM';
      if (h >= 12) { p = 'PM'; if (h > 12) h -= 12; }
      if (h === 0) h = 12;
      setHours(h); setMinutes(m); setPeriod(p);
    }
  }, [value]);

  const handleHourSelect = (h) => { setHours(h); setMode('minutes'); };
  const handleMinuteSelect = (m) => { setMinutes(m); };

  const handleSave = () => {
    let h = hours;
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    onChange(`${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    onClose();
  };

  const ClockFace = () => {
    const numbers = mode === 'hours'
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const currentVal = mode === 'hours' ? hours : minutes;
    const angle = mode === 'hours' ? (hours % 12) * 30 : minutes * 6;

    return (
      <div className="relative w-60 h-60 mx-auto bg-gray-100 dark:bg-dark-300 rounded-full shadow-inner flex items-center justify-center select-none">
        <div className="absolute w-2 h-2 bg-primary-600 rounded-full z-20" />
        <div
          className="absolute w-1 bg-primary-600 origin-bottom z-10 rounded-full"
          style={{ height: '80px', bottom: '50%', left: 'calc(50% - 2px)', transform: `rotate(${angle}deg)`, transition: 'transform 0.2s ease-out' }}
        >
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-primary-600 rounded-full border-2 border-white dark:border-dark-200" />
        </div>
        {numbers.map((num, i) => {
          const deg = i * 30;
          const radian = (deg - 90) * (Math.PI / 180);
          const left = 120 + 85 * Math.cos(radian) - 16;
          const top  = 120 + 85 * Math.sin(radian) - 16;
          const isSelected = num === currentVal || (mode === 'minutes' && num === 0 && currentVal === 60);
          return (
            <div
              key={num}
              onClick={() => mode === 'hours' ? handleHourSelect(num) : handleMinuteSelect(num)}
              className={`absolute w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-bold transition-colors z-20
                ${isSelected ? 'bg-primary-600 text-white shadow-md scale-110' : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
              style={{ left: `${left}px`, top: `${top}px` }}
            >
              {mode === 'minutes' && num < 10 ? `0${num}` : num}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-xl shadow-2xl z-50 w-72 animate-in fade-in zoom-in-95 duration-200"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-4 bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg">
        <div className="flex items-end gap-1">
          <button onClick={() => setMode('hours')} className={`text-3xl font-bold leading-none transition-colors ${mode === 'hours' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}>
            {String(hours).padStart(2, '0')}
          </button>
          <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 leading-none pb-1">:</span>
          <button onClick={() => setMode('minutes')} className={`text-3xl font-bold leading-none transition-colors ${mode === 'minutes' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}>
            {String(minutes).padStart(2, '0')}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => setPeriod('AM')} className={`text-xs font-bold px-2 py-1 rounded ${period === 'AM' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-600 dark:text-gray-400'}`}>AM</button>
          <button onClick={() => setPeriod('PM')} className={`text-xs font-bold px-2 py-1 rounded ${period === 'PM' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-600 dark:text-gray-400'}`}>PM</button>
        </div>
      </div>
      <ClockFace />
      <div className="flex justify-end mt-4 gap-2">
        <button onClick={onClose} className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors">OK</button>
      </div>
    </div>
  );
};

// ── Custom 12h Time Input (same as WorklogForm) ──────────────────────────────
const TimeInput = ({ value, onChange }) => {
  const [timeStr, setTimeStr] = useState('');
  const [period, setPeriod] = useState('AM');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (value) {
      const [dirsHours, dirsMinutes] = value.split(':').map(Number);
      let h = dirsHours;
      let p = 'AM';
      if (h >= 12) { p = 'PM'; if (h > 12) h -= 12; }
      if (h === 0) h = 12;
      setTimeStr(`${String(h).padStart(2, '0')}:${String(dirsMinutes).padStart(2, '0')}`);
      setPeriod(p);
    } else {
      setTimeStr(''); setPeriod('AM');
    }
  }, [value]);

  const handleTimeChange = (e) => {
    let input = e.target.value;
    if (!/^[\d:]*$/.test(input)) return;
    if (input.length === 2 && !input.includes(':') && input.length > timeStr.length) input += ':';
    if (input.length > 5) return;
    setTimeStr(input);
    updateParent(input, period);
  };

  const handleBlur = () => updateParent(timeStr, period);

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateParent(timeStr, newPeriod);
  };

  const updateParent = (tStr, p) => {
    if (tStr.length !== 5 || !tStr.includes(':')) return;
    const [hStr, mStr] = tStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return;
    if (p === 'PM' && h !== 12) h += 12;
    if (p === 'AM' && h === 12) h = 0;
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10 hover:text-primary-600 transition-colors" onClick={() => setShowPicker(!showPicker)}>
        <svg className="h-5 w-5 text-gray-400 hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={timeStr}
        onChange={handleTimeChange}
        onBlur={handleBlur}
        placeholder="09:00"
        className="input-premium pl-10 pr-16 w-full"
      />
      <button type="button" onClick={togglePeriod} className="absolute right-1 top-1 bottom-1 px-3 text-xs font-bold bg-primary-50 text-primary-700 rounded hover:bg-primary-100 transition-colors z-10">
        {period}
      </button>
      {showPicker && (
        <AnalogTimePicker value={value || '09:00'} onChange={onChange} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

// Calculate hours from HH:mm strings
const calcHours = (from, to) => {
  if (!from || !to) return null;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const diff = (th * 60 + tm) - (fh * 60 + fm);
  if (diff <= 0) return null;
  return parseFloat((diff / 60).toFixed(2));
};

const ApplyCompOff = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dateWorked: '',
    fromTime: '',
    toTime: '',
    reason: '',
  });

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleChange = (field) => (e) => setField(field, e.target.value);

  const calculatedHours = useMemo(
    () => calcHours(formData.fromTime, formData.toTime),
    [formData.fromTime, formData.toTime]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateWorked) { toast.error('Please select a date'); return; }
    if (!formData.fromTime)   { toast.error('From time is required'); return; }
    if (!formData.toTime)     { toast.error('To time is required'); return; }
    if (calculatedHours === null) { toast.error('End time must be after start time'); return; }
    if (!formData.reason.trim()) { toast.error('Reason is required'); return; }

    setIsSubmitting(true);
    try {
      await compOffAPI.applyCompOff({
        dateWorked: formData.dateWorked,
        fromTime: formData.fromTime,
        toTime: formData.toTime,
        reason: formData.reason,
      });
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
          Select the date and time you worked or will work, then provide a reason.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.dateWorked}
              onChange={handleChange('dateWorked')}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-servicenow text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-400 dark:text-slate-500">
              Select the weekend or holiday you worked on or will work on.
            </p>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark-700 dark:text-slate-300">
              Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-premium">From Time</label>
                <TimeInput value={formData.fromTime} onChange={(v) => setField('fromTime', v)} />
              </div>
              <div>
                <label className="label-premium">To Time</label>
                <TimeInput value={formData.toTime} onChange={(v) => setField('toTime', v)} />
              </div>
            </div>

            {/* Live calculated hours */}
            {formData.fromTime && formData.toTime && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                calculatedHours !== null
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {calculatedHours !== null ? (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total: <strong>{calculatedHours} hour{calculatedHours !== 1 ? 's' : ''}</strong>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    End time must be after start time
                  </>
                )}
              </div>
            )}
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
              onChange={handleChange('reason')}
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
