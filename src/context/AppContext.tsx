// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string; // Changed from "John" to string
    last_name: string;  // Changed from "Doe" to string
    phone_number: string; // Changed from "+1234567890" to string
    primary_trade: string;
    secondary_trades: string[]; // Changed from ["plumber_pro", "electrician_pro"] to string[]
    business_type: string; // Changed from "solo_operator" to string
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    createInventory: (form: any) => Promise<any>;
    refetchProfile: () => Promise<void>;
    inventoryList: any; // Add this line to match the provider value
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [inventoryList, setInventoryList] = useState(null)

    const fetchUserProfile = async (): Promise<void> => {
        const token = Cookies.get("token");

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
            console.log("Profile Fetched!")
            setUser(data);
            // No return value here, just update state
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const createInventory = async (form: any) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch("https://memblue-backend.onrender.com/api/users/inventory/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const errorDetails = await response.text(); // Capture error details from backend
                throw new Error(`Error creating inventory: ${errorDetails}`);
            }

            const data = await response.json();
            console.log("Inventory created:", data.name);

            return data;

        } catch (error) {
            console.error('createInventory error:', error);
            return null; // Return null or throw depending on how you handle it in UI
        } finally {
            console.log('createInventory finished.');
        }
    };


    const getInventory = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch("https://memblue-backend.onrender.com/api/users/inventory/", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
            });

            if (!response.ok) {
                const errorDetails = await response.text(); // Capture error details from backend
                throw new Error(`Error creating inventory: ${errorDetails}`);
            }

            const data = await response.json();
            setInventoryList(data)
            console.log("Inventories fetched:", data && Array.isArray(data) ? data.length : null);

            return data;

        } catch (error) {
            console.error('getInventory error:', error);
            return null; // Return null or throw depending on how you handle it in UI
        } finally {
            console.log('getInventory finished.');
        }
    };


    useEffect(() => {
        const getfacts = async () => {
            await fetchUserProfile();
            await getInventory();
        }
        getfacts();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, refetchProfile: fetchUserProfile, createInventory, inventoryList }}>
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
