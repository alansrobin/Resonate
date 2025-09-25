// frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    DocumentPlusIcon, 
    MagnifyingGlassIcon, 
    UserCircleIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
    // Use the single AuthContext for all user info
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Jharkhand Civic Portal
                            </h1>
                            <p className="ml-4 text-sm text-gray-600 hidden sm:block">
                                Report and track civic issues in your area
                            </p>
                        </div>
                        
                        {/* Login/Logout/Admin Button */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    {/* FIX: Add a conditional check for the name, and display a professional message */}
                                    {user?.user_name && !isAdmin && (
                                         <span className="text-gray-700 font-medium hidden sm:block">
                                            Hello, {user.user_name}
                                        </span>
                                    )}
                                    
                                    {isAdmin && (
                                        <Link 
                                            to="/admin"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                            <UserCircleIcon className="h-5 w-5 mr-2" />
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                // No one is logged in
                                <Link
                                    to="/auth" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors border-indigo-200"
                                >
                                    <UserCircleIcon className="h-5 w-5 mr-2" />
                                    Login/Signup
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Make Your Voice be Heard
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Report civic issues in Jharkhand and track their resolution. Together, we can make our communities better.
                    </p>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {/* Post Complaint Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
                                <DocumentPlusIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                                Post Complaint
                            </h3>
                            <p className="text-gray-600 text-center mb-8">
                                Report potholes, broken streetlights, garbage issues, and other civic problems in your area.
                            </p>
                            <Link
                                to="/submit"
                                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                Report an Issue
                            </Link>
                        </div>
                    </div>

                    {/* View Status Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
                                <MagnifyingGlassIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                                View Complaint Status
                            </h3>
                            <p className="text-gray-600 text-center mb-8">
                                Track the progress of your reported issues and see when they are being resolved.
                            </p>
                            <Link
                                to="/status"
                                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                                Check Status
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="mt-20">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                        Making a Difference Together
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="gray-600">Always Available</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-green-600 mb-2">Fast</div>
                            <div className="text-gray-600">Quick Response</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 text-center shadow-md">
                            <div className="text-3xl font-bold text-purple-600 mb-2">Free</div>
                            <div className="text-gray-600">No Cost Service</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}