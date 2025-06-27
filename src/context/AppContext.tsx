// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  createInventory: (form: any) => Promise<any>;
  updateInventory: (id: number, form: any) => Promise<any>;
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
  customers: any; // Add this line to match the provider value
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inventoryList, setInventoryList] = useState<InventoryItem[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>("")
  const [toastType, setToastType] = useState<string>("")
  const [customers, setCustomers] = useState(null)

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

  const fetchUserProfile = async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://memblue-backend.onrender.com/api/users/profile/", {
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
      console.log("Profile Fetched!");

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

  const createInventory = async (form: any) => {
    const token = getToken();

    try {
      // Add the owner field to the form data
      const formDataWithOwner = {
        ...form,
        owner: user?.id // Assuming user.id is the owner ID
      };

      const response = await fetch("https://memblue-backend.onrender.com/api/users/inventory/", {
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

  const updateInventory = async (id: number, form: any) => {
    const token = getToken();

    try {
      const response = await fetch(`https://memblue-backend.onrender.com/api/users/inventory/${id}/`, {
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
      const response = await fetch(`https://memblue-backend.onrender.com/api/users/inventory/${id}/`, {
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
      const response = await fetch("https://memblue-backend.onrender.com/api/users/inventory/", {
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
      const res = await fetch('https://memblue-backend.onrender.com/api/users/customers/', {
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
      return data;
    } catch (error) {
      console.error('error: ', error)
      setToastMessage(`${error}: Customer Creation Failed!`)
      setToastType('error')
    }
  };


  const getCustomers = async () => {
    const token = getToken();

    try {
      const res = await fetch('https://memblue-backend.onrender.com/api/users/customers/', {
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

  useEffect(() => {
    const initialize = async () => {
      await fetchUserProfile();
      if (inventoryList == null) {
        await getInventory();
      }
      if (customers == null) {
        await getCustomers();
      }
    };
    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
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
      customers
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