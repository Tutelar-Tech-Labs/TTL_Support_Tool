import axios from './axios';

export const holidayPermissionAPI = {
  applyPermission: async (data) => {
    const response = await axios.post('/holiday-permission/apply', data);
    return response.data;
  },

  getMyPermissions: async () => {
    const response = await axios.get('/holiday-permission/my');
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await axios.get('/admin/holiday-permission');
    return response.data;
  },

  reviewPermission: async (id, data) => {
    const response = await axios.put(`/admin/holiday-permission/${id}/review`, data);
    return response.data;
  },
};
