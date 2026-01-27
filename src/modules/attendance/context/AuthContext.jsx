import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync with Main App LocalStorage
    const loadUser = () => {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');
      const id = localStorage.getItem('userId');
      const name = localStorage.getItem('userName');
      
      if (email && id) {
        setUser({
          _id: id, 
          email,
          role,
          fullName: name,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
    // Optional: Listen for storage events if needed
  }, []);

  const login = () => { console.warn("Use main app login"); };
  const logout = () => { console.warn("Use main app logout"); };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
