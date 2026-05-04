import axios from './axios';

export const compOffAPI = {
  applyCompOff: async (data) => {
    const response = await axios.post('/compoff/apply', data);
    return response.data;
  },

  getMyCompOffRequests: async () => {
    const response = await axios.get('/compoff/my');
    return response.data;
  },

  getAllCompOffRequests: async () => {
    const response = await axios.get('/admin/compoff');
    return response.data;
  },

  reviewCompOffRequest: async (id, data) => {
    const response = await axios.put(`/admin/compoff/${id}/review`, data);
    return response.data;
  },
};
