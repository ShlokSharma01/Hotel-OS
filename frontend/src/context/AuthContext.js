import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [guest, setGuest] = useState(null);
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const gt = localStorage.getItem('hotel_os_guest_token');
    const gd = localStorage.getItem('hotel_os_guest_data');
    if (gt && gd) { try { setGuest(JSON.parse(gd)); } catch {} }

    const st = localStorage.getItem('hotel_os_staff_token');
    const sd = localStorage.getItem('hotel_os_staff_data');
    if (st && sd) { try { setStaff(JSON.parse(sd)); } catch {} }
  }, []);

  const loginGuest = (token, guestData) => {
    localStorage.setItem('hotel_os_guest_token', token);
    localStorage.setItem('hotel_os_guest_data', JSON.stringify(guestData));
    setGuest(guestData);
  };

  const loginStaff = (token, staffData) => {
    localStorage.setItem('hotel_os_staff_token', token);
    localStorage.setItem('hotel_os_staff_data', JSON.stringify(staffData));
    setStaff(staffData);
  };

  const logoutGuest = () => {
    localStorage.removeItem('hotel_os_guest_token');
    localStorage.removeItem('hotel_os_guest_data');
    setGuest(null);
  };

  const logoutStaff = () => {
    localStorage.removeItem('hotel_os_staff_token');
    localStorage.removeItem('hotel_os_staff_data');
    setStaff(null);
  };

  return (
    <AuthContext.Provider value={{ guest, staff, loginGuest, loginStaff, logoutGuest, logoutStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
