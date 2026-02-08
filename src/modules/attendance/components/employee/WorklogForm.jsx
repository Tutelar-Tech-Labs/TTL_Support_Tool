import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { employeeAPI } from '../../api/employee';
import Card from '../ui/Card';
import Button from '../ui/Button';
import 'react-datepicker/dist/react-datepicker.css';

const worklogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  fromTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  toTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  activity: z.string().min(5, 'Activity description must be at least 5 characters'),
  customerName: z.string().optional(),
  ticketId: z.string().optional(),
});

// Analog Clock Time Picker
const AnalogTimePicker = ({ value, onChange, onClose }) => {
  const [mode, setMode] = useState('hours'); // 'hours' | 'minutes'
  const [period, setPeriod] = useState('AM');
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hStr, mStr] = value.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      
      let p = 'AM';
      if (h >= 12) {
        p = 'PM';
        if (h > 12) h -= 12;
      }
      if (h === 0) h = 12;

      setHours(h);
      setMinutes(m);
      setPeriod(p);
    }
  }, [value]);

  const handleHourSelect = (h) => {
    setHours(h);
    setMode('minutes');
  };

  const handleMinuteSelect = (m) => {
    setMinutes(m);
    // Don't auto close, let user confirm or click away
  };

  const handleSave = () => {
    let h = hours;
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    
    const timeStr = `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onChange(timeStr);
    onClose();
  };

  // Clock Face Component
  const ClockFace = () => {
    const radius = 100;
    const center = 120;
    const numbers = mode === 'hours' 
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    const currentVal = mode === 'hours' ? hours : minutes;
    
    // Calculate hand angle
    let angle = 0;
    if (mode === 'hours') {
      angle = (hours % 12) * 30; // 360 / 12 = 30 deg per hour
    } else {
      angle = minutes * 6; // 360 / 60 = 6 deg per minute
    }

    return (
      <div className="relative w-60 h-60 mx-auto bg-gray-100 dark:bg-dark-300 rounded-full shadow-inner flex items-center justify-center select-none">
        {/* Center Dot */}
        <div className="absolute w-2 h-2 bg-primary-600 rounded-full z-20"></div>

        {/* Clock Hand */}
        <div 
          className="absolute w-1 bg-primary-600 origin-bottom z-10 rounded-full"
          style={{ 
            height: '80px', 
            bottom: '50%', 
            left: 'calc(50% - 2px)',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
           {/* Tip Circle */}
           <div className="absolute -top-2 -left-2 w-5 h-5 bg-primary-600 rounded-full border-2 border-white dark:border-dark-200"></div>
        </div>

        {/* Numbers */}
        {numbers.map((num, i) => {
          // Position calculation
          // 0 deg is at 12 o'clock (top)
          // i * 30 degrees for hours
          const deg = mode === 'hours' ? i * 30 : (i * 30); // Positions match for 12 items
          const radian = (deg - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(radian);
          const y = center + radius * Math.sin(radian);

          // Adjust for container size (240px)
          // Center is 120, 120
          const left = 120 + 85 * Math.cos(radian) - 16; // 85px radius, 16px offset (half width)
          const top = 120 + 85 * Math.sin(radian) - 16;

          const isSelected = num === currentVal || (mode === 'minutes' && num === 0 && currentVal === 60);

          return (
            <div
              key={num}
              onClick={() => mode === 'hours' ? handleHourSelect(num) : handleMinuteSelect(num)}
              className={`absolute w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-bold transition-colors z-20
                ${isSelected 
                  ? 'bg-primary-600 text-white shadow-md scale-110' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                }`}
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
      {/* Header Display */}
      <div className="flex items-center justify-between mb-4 bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg">
        <div className="flex items-end gap-1">
          <button
            onClick={() => setMode('hours')}
            className={`text-3xl font-bold leading-none transition-colors ${
              mode === 'hours' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
            }`}
          >
            {String(hours).padStart(2, '0')}
          </button>
          <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 leading-none pb-1">:</span>
          <button
            onClick={() => setMode('minutes')}
            className={`text-3xl font-bold leading-none transition-colors ${
              mode === 'minutes' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
            }`}
          >
            {String(minutes).padStart(2, '0')}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setPeriod('AM')}
            className={`text-xs font-bold px-2 py-1 rounded ${
              period === 'AM' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-600 dark:text-gray-400'
            }`}
          >
            AM
          </button>
          <button
            onClick={() => setPeriod('PM')}
            className={`text-xs font-bold px-2 py-1 rounded ${
              period === 'PM' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-600 dark:text-gray-400'
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock Face */}
      <ClockFace />

      {/* Footer Actions */}
      <div className="flex justify-end mt-4 gap-2">
        <button 
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Custom 12h Time Input Component
const TimeInput = ({ value, onChange, className }) => {
  const [timeStr, setTimeStr] = useState('');
  const [period, setPeriod] = useState('AM');
  const [showPicker, setShowPicker] = useState(false);

  // Parse initial 24h value to 12h
  useEffect(() => {
    if (value) {
      const [dirsHours, dirsMinutes] = value.split(':').map(Number);
      let h = dirsHours;
      let p = 'AM';
      if (h >= 12) {
        p = 'PM';
        if (h > 12) h -= 12;
      }
      if (h === 0) h = 12;

      const formattedH = String(h).padStart(2, '0');
      const formattedM = String(dirsMinutes).padStart(2, '0');
      setTimeStr(`${formattedH}:${formattedM}`);
      setPeriod(p);
    } else {
      setTimeStr('');
      setPeriod('AM');
    }
  }, [value]);

  const handleTimeChange = (e) => {
    let input = e.target.value;
    // Allow digits and colon only
    if (!/^[\d:]*$/.test(input)) return;

    // Auto-insert colon after 2 digits
    if (input.length === 2 && !input.includes(':')) {
      if (input.length > timeStr.length) {
        input += ':';
      }
    }

    // Max length 5 (HH:MM)
    if (input.length > 5) return;

    setTimeStr(input);
    updateParent(input, period);
  };

  const handleBlur = () => {
    // Validate format on blur
    if (timeStr.length === 5) {
      const [h, m] = timeStr.split(':').map(Number);
      if (h > 12 || h < 1 || m > 59) {
        // Invalid time
      }
    }
    updateParent(timeStr, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateParent(timeStr, newPeriod);
  };

  const updateParent = (tStr, p) => {
    // Convert to 24h for parent
    if (tStr.length !== 5 || !tStr.includes(':')) {
      return;
    }

    const [hStr, mStr] = tStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    if (isNaN(h) || isNaN(m)) return;

    if (p === 'PM' && h !== 12) h += 12;
    if (p === 'AM' && h === 12) h = 0;

    const h24 = String(h).padStart(2, '0');
    const m24 = String(m).padStart(2, '0');

    onChange(`${h24}:${m24}`);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Clock Icon Toggle */}
      <div 
        className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10 hover:text-primary-600 transition-colors"
        onClick={() => setShowPicker(!showPicker)}
      >
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
      
      <button
        type="button"
        onClick={togglePeriod}
        className="absolute right-1 top-1 bottom-1 px-3 text-xs font-bold bg-primary-50 text-primary-700 rounded hover:bg-primary-100 transition-colors z-10"
      >
        {period}
      </button>

      {/* Analog Time Picker Popup */}
      {showPicker && (
        <AnalogTimePicker 
          value={value || '09:00'} 
          onChange={onChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

const WorklogForm = ({ onWorklogCreated }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(worklogSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      fromTime: '',
      toTime: '',
      activity: '',
      customerName: '',
      ticketId: '',
    },
  });

  const onSubmit = async (data) => {
    // Validate time range
    const [fromHours, fromMinutes] = data.fromTime.split(':').map(Number);
    const [toHours, toMinutes] = data.toTime.split(':').map(Number);
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    const toTotalMinutes = toHours * 60 + toMinutes;

    if (toTotalMinutes <= fromTotalMinutes) {
      toast.error('End time must be after start time');
      return;
    }

    setIsLoading(true);
    try {
      const response = await employeeAPI.createWorklog(data);
      toast.success(response.message || 'Worklog created successfully!');
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        fromTime: '',
        toTime: '',
        activity: '',
        customerName: '',
        ticketId: '',
      });
      setSelectedDate(new Date());
      if (onWorklogCreated) {
        onWorklogCreated();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create worklog';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    reset({ ...watch(), date: formattedDate });
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-dark-900">Add Worklog</h2>
          <p className="text-sm text-dark-600">Track your daily activities and work hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Date Picker */}
        <div>
          <label className="label-premium">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="input-premium pl-10 w-full"
              maxDate={new Date()}
            />
          </div>
          <input type="hidden" {...register('date')} />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Time */}
          <div>
            <label className="label-premium">From Time</label>
            <Controller
              name="fromTime"
              control={control}
              render={({ field }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.fromTime && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.fromTime.message}</p>
            )}
          </div>

          {/* To Time */}
          <div>
            <label className="label-premium">To Time</label>
            <Controller
              name="toTime"
              control={control}
              render={({ field }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.toTime && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.toTime.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Name */}
          <div>
            <label className="label-premium">Customer Name <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              {...register('customerName')}
              placeholder="e.g. Acme Corp"
              className="input-premium w-full"
            />
          </div>

          {/* Ticket ID */}
          <div>
            <label className="label-premium">Ticket ID <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              {...register('ticketId')}
              placeholder="e.g. TKT-1234"
              className="input-premium w-full"
            />
          </div>
        </div>

        {/* Activity Description */}
        <div>
          <label className="label-premium">Activity Description</label>
          <div className="relative">
            <textarea
              {...register('activity')}
              rows={4}
              className="input-premium resize-none"
              placeholder="Describe what you worked on..."
            />
          </div>
          {errors.activity && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.activity.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Worklog...' : 'Add Worklog'}
        </Button>
      </form>
    </Card>
  );
};

export default WorklogForm;
