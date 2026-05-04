import axios from './axios';

export const employeeAPI = {
  // Mark attendance
  markPresent: async (data) => {
    const response = await axios.post('/attendance/mark-present', data);
    return response.data;
  },

  // Get attendance
  getAttendance: async (month) => {
    const response = await axios.get(`/attendance?month=${month}`);
    return response.data;
  },

  // Get attendance by date range
  getAttendanceByRange: async (from, to) => {
    const response = await axios.get(`/attendance/range?from=${from}&to=${to}`);
    return response.data;
  },

  // Create worklog
  createWorklog: async (data) => {
    const response = await axios.post('/worklogs', data);
    return response.data;
  },

  // Get worklogs by range
  getWorklogsByRange: async (from, to) => {
    const response = await axios.get(`/worklogs/range?from=${from}&to=${to}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axios.put('/attendance/profile', data);
    return response.data;
  },
};
