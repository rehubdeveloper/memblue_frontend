import { useContext, useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { AuthContext } from '../context/AppContext';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Default to admin user
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const authContext = useContext(AuthContext);
  // Ensure teamMembers is typed as User[] by mapping and filling missing properties
  const teamMembers: User[] = (authContext?.teamMembers ?? []).map((tm: any) => ({
    id: tm.id,
    name: tm.name,
    email: tm.email,
    role: tm.role,
    phone: tm.phone,
    businessId: tm.businessId ?? '', // Provide a default or fetch from elsewhere if needed
    avatar: tm.avatar
  }));
  const login = (email: string, password: string) => {
    // Mock login - in real app this would validate credentials
    const user = teamMembers.find(u => u.email === email);
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
    const user: User | undefined = teamMembers.find((u: User) => u.id === userId);
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