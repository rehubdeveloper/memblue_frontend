// src/context/AuthContext.tsx (Updated with team functions)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { CustomerFormData } from '../types';

interface User {
  id: number;
  can_create_jobs: boolean;
  username: string;
  email: string;
  first_name: string;
  role: 'admin' | 'solo' | 'member';
  last_name: string;
  phone_number: string;
  primary_trade: string;
  secondary_trades: string[];
  business_type: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  supplier: string;
  cost_per_unit: string;
  total_value: string;
  stock_level: number;
  reorder_at: number;
  category: string;
  ideal_stock: number;
  is_active: boolean;
  last_updated: string;
  owner_code: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  position: string;
  username: string;
  can_create_jobs: boolean;
  date_joined: string;
  is_active: boolean;
  role: string
}

interface WorkOrder {
  id: number;
  job_number: string;
  job_type: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  customer: number;
  customer_name: string;
  created_at: string;
  scheduled_for: string;
  assigned_to: string | number;
  progress_current: number;
  progress_total: number;
  primary_trade: string;
  amount: string;
  owner: number;
  address: string;
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  createInventory: (form: any) => Promise<any>;
  updateInventory: (id: number, form: Partial<CustomerFormData>) => Promise<any>;
  deleteInventory: (id: number) => Promise<boolean>;
  refetchProfile: () => Promise<void>;
  refetchInventory: () => Promise<void>;
  inventoryList: InventoryItem[] | null;
  setToastMessage: React.Dispatch<React.SetStateAction<string | null>>;
  toastMessage: string | null;
  setToastType: React.Dispatch<React.SetStateAction<string>>;
  toastType: string;
  addToast: (message: string, type: Toast['type']) => void;
  toastQueue: Toast[];
  removeToast: (id: number) => void;
  createCustomer: (formData: any) => Promise<any>;
  updateCustomer: (id: number, data: Partial<CustomerFormData>) => Promise<any>;
  deleteCustomer: (id: number) => Promise<boolean>;
  customers: CustomerFormData[] | null;
  // Team functions
  sendTeamInvite: () => Promise<string>;
  teamMembers: TeamMember[] | null;
  getCustomers: () => Promise<void>;
  getTeamMembers: () => Promise<void>;
  grantJobCreationPermission: (userId: number) => Promise<any>;
  logout: () => void;
  // Work Orders
  createWorkOrder: (form: any) => Promise<any>;
  workOrders: WorkOrder[] | null;
  getWorkOrders: () => Promise<void>;
  getWorkOrder: (id: number) => Promise<WorkOrder>;
  updateWorkOrder: (id: number, updates: Partial<WorkOrder>) => Promise<WorkOrder>;
  deleteWorkOrder: (id: number) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inventoryList, setInventoryList] = useState<InventoryItem[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>("")
  const [toastType, setToastType] = useState<string>("")
  const [customers, setCustomers] = useState<CustomerFormData[] | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[] | null>(null);

  const [toastQueue, setToastQueue] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToastQueue(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToastQueue(prev => prev.filter(toast => toast.id !== id));
  };

  // Helper function to get token consistently
  const getToken = (): string | null => {
    return Cookies.get("token") || localStorage.getItem('token');
  };

  // Helper to set token in both cookies and localStorage
  const setToken = (token: string) => {
    Cookies.set('token', token, { expires: 7 });
    localStorage.setItem('token', token);
  };

  const fetchUserProfile = async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      console.log("Profile Fetched!", data);

      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setToastMessage(error instanceof Error ? error.message : String(error));
      setToastType('error')
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Team Functions
  const sendTeamInvite = async (): Promise<string> => {
    const token = getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/team/invite/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send invite: ${errorText}`);
      }

      const data = await response.json();

      // Extract the UUID from the returned link

      const uuid = data.token

      // Create the onboarding URL using window.location.origin
      const onboardingUrl = `${window.location.origin}/onboard/${uuid}`;

      setToastMessage(`Team invite sent successfully!`);
      setToastType('success')

      return onboardingUrl;

    } catch (error) {
      console.error('Error sending team invite:', error);
      addToast(`Error sending invite: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  };

  const getTeamMembers = async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/team/members/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch team members: ${errorText}`);
      }

      const data = await response.json();
      setTeamMembers(data);
      console.log("Team members fetched:", data && Array.isArray(data) ? data.length : 0);
      console.log("Team members:", data);

    } catch (error) {
      console.error('Error fetching team members:', error);
      addToast(`Error fetching team members: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setTeamMembers(null);
    }
  };

  const grantJobCreationPermission = async (userId: number): Promise<any> => {
    const token = getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/team/grant-job-permission/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to grant job creation permission: ${errorText}`);
      }

      const data = await response.json();
      setToastMessage('Job creation permission granted successfully!');
      setToastType('success');

      // Refresh team members to get updated permissions
      await getTeamMembers();

      return data;
    } catch (error) {
      console.error('Error granting job creation permission:', error);
      setToastMessage(`Error granting job creation permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setToastType('error');
      throw error;
    }
  };

  const createInventory = async (form: any) => {
    const token = getToken();

    try {
      // Add the owner field to the form data
      const formDataWithOwner = {
        ...form,
        owner: user?.id // Assuming user.id is the owner ID
      };

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/inventory/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(formDataWithOwner)
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating inventory: ${errorDetails}`);
      }

      const data = await response.json();
      console.log("Inventory created:", data.name);

      // Refresh inventory list after creation
      await getInventory();
      setToastMessage('Inventories Fetched!')
      setToastType('success')
      return data;

    } catch (error) {
      console.error('createInventory error:', error);
      setToastMessage(`Couldn't Get Inventories: ${error}`)
      setToastType('error')
      throw error; // Re-throw so the component can handle it
    }
  };

  const updateInventory = async (id: number, form: Partial<CustomerFormData>) => {
    const token = getToken();

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/inventory/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error updating inventory: ${errorDetails}`);
      }

      const data = await response.json();
      console.log("Inventory updated:", data.name);
      setToastMessage(`${data.name} Inventory Updated!`)
      setToastType('success')

      // Refresh inventory list after update
      await getInventory();

      return data;

    } catch (error) {
      console.error('updateInventory error:', error);
      setToastMessage(`Couldn't Update Inventory: ${error}`)
      setToastType('error')
      throw error;
    }
  };

  const deleteInventory = async (id: number): Promise<boolean> => {
    const token = getToken();

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/inventory/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error deleting inventory: ${errorDetails}`);
      }

      console.log("Inventory deleted:", id);
      setToastMessage(`Inventory Of ID ${id} Has Been Deleted!`)
      setToastType('error')

      // Refresh inventory list after deletion
      await getInventory();

      return true;

    } catch (error) {
      console.error('deleteInventory error:', error);
      setToastMessage(`Couldn't Delete Inventory: ${error}`)
      setToastType('error')
      throw error;
    }
  };

  const getInventory = async () => {
    const token = getToken();

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/inventory/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching inventory: ${errorDetails}`);
      }

      const data = await response.json();
      setInventoryList(data);
      console.log("Inventories fetched:", data && Array.isArray(data) ? data.length : 0);
      return data;

    } catch (error) {
      console.error('getInventory error:', error);
      setToastMessage(`Error Fetching Inventories: ${error}`)
      setToastType('error')
      setInventoryList(null);
      return null;
    }
  };

  const createCustomer = async (formData: any) => {
    const token = getToken();

    const payload = {
      ...formData,
      tags: formData.tags?.split(',').map((tag: string) => tag.trim()) || [],
      owner: user?.id, // 🔥 Add owner from authenticated user
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/customers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      const data = await res.json();
      console.log(`Customer "${data.name}" created successfully`)
      setToastMessage(`Customer "${data.name}" created successfully`);
      setToastType('success')

      // Refresh customers list after creation
      await getCustomers();

      return data;
    } catch (error) {
      console.error('error: ', error)
      setToastMessage(`${error}: Customer Creation Failed!`)
      setToastType('error')
      throw error;
    }
  };

  const updateCustomer = async (id: number, data: Partial<CustomerFormData>) => {
    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/customers/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update customer: ${errorText}`);
      }

      const updatedCustomer = await res.json();
      console.log(`Customer "${updatedCustomer.name}" updated successfully`)
      setToastMessage(`Customer "${updatedCustomer.name}" updated successfully`);
      setToastType('success')

      // Refresh customers list after update
      await getCustomers();

      return updatedCustomer;
    } catch (error) {
      console.error('error: ', error)
      setToastMessage(`${error}: Customer Update Failed!`)
      setToastType('error')
      throw error;
    }
  };

  const deleteCustomer = async (id: number): Promise<boolean> => {
    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/customers/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete customer: ${errorText}`);
      }

      console.log(`Customer with ID ${id} deleted successfully`)
      setToastMessage(`Customer deleted successfully`);
      setToastType('success')

      // Refresh customers list after deletion
      await getCustomers();

      return true;
    } catch (error) {
      console.error('error: ', error)
      setToastMessage(`${error}: Customer Deletion Failed!`)
      setToastType('error')
      return false;
    }
  };

  const getCustomers = async () => {
    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/customers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get customer: ${errorText}`);
      }

      const data = await res.json();
      setCustomers(data)
      console.log(`Customers Fetched successfully`)
      return data;
    } catch (error) {
      console.error('error: ', error)
      setToastMessage(`${error}: Customer Fetch Failed!`)
      setToastType('error')
    }
  };

  const refetchInventory = async (): Promise<void> => {
    await getInventory();
  };

  const logout = async () => {
    const token = getToken();
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      Cookies.remove('token');
      localStorage.removeItem('token');
      setToastMessage('Logged out successfully!');
      setToastType('success');
      window.location.href = '/';
    }
  };

  // Work Orders Function
  const createWorkOrder = async (form: any) => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating work order: ${errorDetails}`);
      }
      const data = await response.json();
      setToastMessage('Work order created successfully!');
      setToastType('success');
      return data;
    } catch (error) {
      console.error('createWorkOrder error:', error);
      setToastMessage(`Couldn't create work order: ${error}`);
      setToastType('error');
      throw error;
    }
  };

  const getWorkOrders = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching work orders: ${errorDetails}`);
      }
      const data = await response.json();
      setWorkOrders(data);
      return data;
    } catch (error) {
      console.error('getWorkOrders error:', error);
      setToastMessage(`Error Fetching Work Orders: ${error}`);
      setToastType('error');
      setWorkOrders(null);
      return null;
    }
  };

  // Work Orders Functions
  const getWorkOrder = async (id: number) => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching work order: ${errorDetails}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('getWorkOrder error:', error);
      setToastMessage(`Error fetching work order: ${error}`);
      setToastType('error');
      throw error;
    }
  };

  const updateWorkOrder = async (id: number, updates: any) => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error updating work order: ${errorDetails}`);
      }
      const data = await response.json();
      setToastMessage('Work order updated successfully!');
      setToastType('success');

      // Refresh work orders list
      await getWorkOrders();

      return data;
    } catch (error) {
      console.error('updateWorkOrder error:', error);
      setToastMessage(`Error updating work order: ${error}`);
      setToastType('error');
      throw error;
    }
  };

  const deleteWorkOrder = async (id: number) => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error deleting work order: ${errorDetails}`);
      }
      setToastMessage('Work order deleted successfully!');
      setToastType('success');

      // Refresh work orders list
      await getWorkOrders();

      return true;
    } catch (error) {
      console.error('deleteWorkOrder error:', error);
      setToastMessage(`Error deleting work order: ${error}`);
      setToastType('error');
      throw error;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserProfile();

      await getInventory();

      await getCustomers();


      await getTeamMembers();

    };
    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      getCustomers,
      isLoading,
      refetchProfile: fetchUserProfile,
      createInventory,
      updateInventory,
      deleteInventory,
      refetchInventory,
      inventoryList,
      setToastMessage,
      toastMessage,
      setToastType,
      toastType,
      addToast,
      toastQueue,
      removeToast,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      customers,
      // Team functions
      sendTeamInvite,
      teamMembers,
      getTeamMembers,
      grantJobCreationPermission,
      logout,
      // Work Orders
      createWorkOrder,
      workOrders,
      getWorkOrders,
      getWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};