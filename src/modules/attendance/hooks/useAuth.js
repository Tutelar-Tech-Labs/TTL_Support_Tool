import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const email = localStorage.getItem('userEmail');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
         // Ensure fallbacks if some fields are missing in stored object but present in individual keys
         setUser({
            ...parsedUser,
            fullName: parsedUser.fullName || localStorage.getItem('userName') || parsedUser.email.split('@')[0],
         });
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    } else if (email) {
      const role = localStorage.getItem('userRole');
      const id = localStorage.getItem('userId');
      const name = localStorage.getItem('userName');
      
      setUser({
        _id: id,
        id: id,
        email,
        role,
        fullName: name || email.split('@')[0],
        employeeId: id ? 'EMP-' + id.substring(0, 4).toUpperCase() : 'EMP-001',
      });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return { user, logout, loading };
};
