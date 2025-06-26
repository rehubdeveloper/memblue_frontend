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
    refetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUserProfile = async (): Promise<void> => {
        const token = localStorage.getItem("token");

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
            console.log(data)
            setUser(data);
            // No return value here, just update state
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, refetchProfile: fetchUserProfile }}>
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
