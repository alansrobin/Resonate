// frontend/src/main.jsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SubmitReport from './pages/SubmitReport'
import ViewStatus from './pages/ViewStatus'
import AuthPage from './pages/AuthPage' 
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { AuthProvider } from './context/AuthContext' // Only use AuthProvider
import ProtectedRoute from './context/ProtectedRoute' 
import './styles.css'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Routes>
                        <Route path="/" element={<AuthPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/submit" element={<SubmitReport />} />
                        <Route path="/status" element={<ViewStatus />} />
                        <Route 
                            path="/admin" 
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}

createRoot(document.getElementById('root')).render(<App />)