// frontend/src/pages/ResetPassword.jsx

import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LockClosedIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!token) {
            setError("Missing or invalid reset token.");
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const resp = await fetch("http://127.0.0.1:8000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                throw new Error(data.detail || data.message || "Failed to reset password");
            }
            setMessage("Password updated successfully. Redirecting to login...");
            setPassword("");
            setConfirmPassword("");
            // Redirect to login after a short delay
            setTimeout(() => navigate("/auth"), 1500);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again later.");
            console.error("ResetPassword error:", err);
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
                    <LockClosedIcon className="h-16 w-16 text-indigo-600 mx-auto" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Set a new password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Choose a strong password for your account.
                    </p>
                </div>

                <div className="p-8">
                    {message && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 text-sm font-medium">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 text-center rounded-lg bg-red-100 p-2 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 appearance-none rounded-lg block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm new password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 appearance-none rounded-lg block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                                "Reset password"
                            )}
                        </motion.button>
                    </form>

                    <div className="text-center mt-6">
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
