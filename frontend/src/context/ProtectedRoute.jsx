// frontend/src/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ adminOnly, children }) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children ? children : <Outlet />;
}