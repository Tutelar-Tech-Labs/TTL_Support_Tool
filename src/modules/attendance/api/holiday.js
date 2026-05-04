import axios from './axios';

export const holidayAPI = {
  getHolidays: async (year, month) => {
    const response = await axios.get('/holidays', { params: { year, month } });
    return response.data;
  },

  createHoliday: async (holidayData) => {
    const response = await axios.post('/admin/holidays', holidayData);
    return response.data;
  },

  updateHoliday: async (id, holidayData) => {
    const response = await axios.put(`/admin/holidays/${id}`, holidayData);
    return response.data;
  },

  deleteHoliday: async (id) => {
    const response = await axios.delete(`/admin/holidays/${id}`);
    return response.data;
  },
};
