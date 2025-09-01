import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "accounts" | "hr" | "employee" | "lead";
  profileImage?: string;
  resetOtp?: string;
  resetOtpExpireAt?: number;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://korus-ems-backend.vercel.app/api/auth/verify",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000, // 10 second timeout
          }
        );

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://korus-ems-backend.vercel.app/api/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        return response;
      } else {
        return response;
      }
    } catch (error: any) {
      // Return a proper error response object instead of false
      return {
        data: {
          success: false,
          message: error.response?.data?.message || error.message || "Connection timed out!",
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
