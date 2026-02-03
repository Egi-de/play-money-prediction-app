import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    const userId = localStorage.getItem('userId');
    console.log('[AdminContext] Checking admin status for userId:', userId);
    
    if (userId) {
      try {
        const res = await api.get('/admin/check', { params: { userId } });
        console.log('[AdminContext] Admin check response:', res.data);
        setIsAdmin(res.data.isAdmin);
      } catch (err) {
        console.error('[AdminContext] Error checking admin status:', err);
        setIsAdmin(false);
      }
    } else {
      console.log('[AdminContext] No userId found, setting isAdmin to false');
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const resetAdminStatus = () => {
    console.log('[AdminContext] Resetting admin status');
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loading, checkAdminStatus, resetAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
