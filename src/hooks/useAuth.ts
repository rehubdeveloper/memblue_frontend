import { useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Default to admin user
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email: string, password: string) => {
    // Mock login - in real app this would validate credentials
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null as any);
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchUser
  };
};