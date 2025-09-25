// frontend/src/pages/AuthPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LockClosedIcon,
    UserCircleIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // Add new state for success message
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Clear both error and success messages
        setSuccessMessage("");

        if (!isLogin && form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await login({ email: form.email, password: form.password });
            } else {
                await signup({ name: form.name, email: form.email, password: form.password });
                
                setIsLogin(true);
                setForm({ name: "", email: form.email, password: "", confirmPassword: "" });
                setSuccessMessage("Account created successfully! Please log in."); // Set success message
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
            console.error("Auth error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-8 text-center border-b border-gray-100">
                    <motion.div
                        key={isLogin ? "loginIcon" : "signupIcon"}
                        initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center"
                    >
                        {isLogin ? (
                            <UserCircleIcon className="h-16 w-16 text-indigo-600" />
                        ) : (
                            <UserPlusIcon className="h-16 w-16 text-indigo-600" />
                        )}
                    </motion.div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        {isLogin ? "User Login" : "Create Account"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin
                            ? "Sign in to access the Jharkhand Civic Portal"
                            : "Register to start reporting and tracking civic issues"}
                    </p>
                </div>
                <div className="p-8">
                    {/* Conditional rendering for success message */}
                    {successMessage && (
                        <div className="mb-4 text-center rounded-lg bg-green-100 p-2 text-green-700 text-sm font-medium">
                            {successMessage}
                        </div>
                    )}
                    {/* Conditional rendering for error message */}
                    {error && (
                        <div className="mb-4 text-center rounded-lg bg-red-100 p-2 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? "loginForm" : "signupForm"}
                            initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? -50 : 50 }}
                            transition={{ duration: 0.5 }}
                            onSubmit={handleAuthSubmit}
                            className="space-y-6"
                        >
                            <div className="rounded-md shadow-sm -space-y-px">
                                {!isLogin && (
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                )}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className={`appearance-none ${
                                        isLogin ? "rounded-t-lg" : ""
                                    } relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className={`appearance-none ${
                                        isLogin ? "rounded-b-lg" : ""
                                    } relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                                {!isLogin && (
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="appearance-none rounded-b-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                )}
                            </div>
                            {isLogin && (
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center text-gray-600">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                                        />
                                        Remember me
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    <>
                                        {isLogin ? (
                                            <LockClosedIcon className="h-5 w-5 text-indigo-200 group-hover:text-indigo-100 mr-2" />
                                        ) : (
                                            <UserPlusIcon className="h-5 w-5 text-indigo-200 group-hover:text-indigo-100 mr-2" />
                                        )}
                                        {isLogin ? "Sign In" : "Sign Up"}
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>
                    <div className="text-center mt-6">
                        {isLogin ? (
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => {
                                        setIsLogin(false);
                                        setError("");
                                        setSuccessMessage(""); // Clear messages on view change
                                    }}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition"
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Already registered?{" "}
                                <button
                                    onClick={() => {
                                        setIsLogin(true);
                                        setError("");
                                        setSuccessMessage(""); // Clear messages on view change
                                    }}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition"
                                >
                                    Log in
                                </button>
                            </p>
                        )}
                    </div>
                    <div className="text-center mt-4">
                        <Link
                            to="/"
                            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}