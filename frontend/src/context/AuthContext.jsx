// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Failed to parse userData from localStorage:", error);
            return null;
        }
    });
    const navigate = useNavigate();

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    // NEW: Centralized API call logic for signup
    const signup = async (formData) => {
        const url = "http://127.0.0.1:8000/auth/signup"; // Corrected URL

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (Array.isArray(data.detail) && data.detail.length > 0) {
                throw new Error(data.detail[0].msg);
            } else {
                throw new Error(data.detail || "Signup failed.");
            }
        }
        return data; // Return the new user data
    };

    // NEW: Centralized API call logic for login
    const login = async (formData) => {
        const url = "http://127.0.0.1:8000/auth/login"; // Corrected URL

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (Array.isArray(data.detail) && data.detail.length > 0) {
                throw new Error(data.detail[0].msg);
            } else {
                throw new Error(data.detail || "Login failed.");
            }
        }

        // Store user data on successful login
        setUser(data);
        localStorage.setItem('userData', JSON.stringify(data));
        
        if (data.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/home');
        }
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userData');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAdmin,
            login,
            logout,
            signup // Expose the new signup function
        }}>
            {children}
        </AuthContext.Provider>
    );
};