// context/AuthContext.tsx
'use client';
import { createContext, useContext } from 'react';

type AuthContextType = {
  userId: string | null;
};

const AuthContext = createContext<AuthContextType>({ userId: null });

export const AuthProvider = ({ children, userId }: { children: React.ReactNode; userId: string | null }) => {
  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);