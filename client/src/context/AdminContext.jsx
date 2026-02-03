import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const res = await api.get('/admin/check', { params: { userId } });
        setIsAdmin(res.data.isAdmin);
      } catch (err) {
        console.error('Error checking admin status', err);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
