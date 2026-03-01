import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('token'); // Also remove token if it exists
    setUser(null);
    window.location.href = '/'; // Redirect to login page
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Session Management: Inactivity auto-logout
  useEffect(() => {
    if (!user) return;

    // Timeout duration: 5 minutes (for testing)
    // For 10 hours later: 10 * 60 * 60 * 1000
    const INACTIVITY_TIMEOUT = 10 * 60 * 60 * 1000; 
    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        console.log("Auto-logging out due to inactivity");
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    // Initial setup
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout]);

  const login = () => { console.warn("Use main app login"); };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
