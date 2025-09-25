// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReportCard from "../components/ReportCard";
import {
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:8000";

export default function AdminDashboard() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/auth');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    useEffect(() => {
        let filtered = reports;
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(report => report.status === statusFilter);
        }
        
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(report => report.category === categoryFilter);
        }
        
        setFilteredReports(filtered);
    }, [reports, statusFilter, categoryFilter]);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        
        async function loadReports() {
            try {
                const res = await fetch(`${API_BASE}/api/v1/reports/`, {
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch reports");
                const data = await res.json();
                setReports(data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading reports:", err);
                setLoading(false);
            }
        }
        loadReports();

        // WebSocket connection
        const ws = new WebSocket(`${API_BASE}/ws/admin?token=${user.access_token}`);
        ws.onopen = () => console.log("Admin WS connected");
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "report_created") {
                    setReports((prev) => [msg.report, ...prev]);
                } else if (msg.type === "report_updated") {
                    setReports((prev) => prev.map((r) => (r.id === msg.report.id ? msg.report : r)));
                } else if (msg.type === "report_deleted") {
                    setReports((prev) => prev.filter((r) => r.id !== msg.report_id));
                }
            } catch (err) {
                console.error("WS message parse error", err);
            }
        };
        ws.onclose = () => console.log("Admin WS closed");
        ws.onerror = (e) => console.error("Admin WS error", e);

        return () => {
            try { ws.close(); } catch (e) {}
        };
    }, [isAuthenticated, isAdmin, user]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    const getStats = () => {
        const total = reports.length;
        const newReports = reports.filter(r => r.status === 'new').length;
        const inProgress = reports.filter(r => r.status === 'in_progress').length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const acknowledged = reports.filter(r => r.status === 'acknowledged').length;
        
        return { total, newReports, inProgress, resolved, acknowledged };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <UserGroupIcon className="h-8 w-8 text-indigo-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">Manage civic issue reports</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                View Public Site
                            </Link>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">New Reports</dt>
                                        <dd className="text-lg font-medium text-blue-600">{stats.newReports}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                                        <dd className="text-lg font-medium text-yellow-600">{stats.inProgress + stats.acknowledged}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                                        <dd className="text-lg font-medium text-green-600">{stats.resolved}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Reports</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="acknowledged">Acknowledged</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="pothole">Pothole</option>
                                    <option value="streetlight">Streetlight</option>
                                    <option value="garbage">Garbage</option>
                                    <option value="drainage">Drainage</option>
                                    <option value="road">Road</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Reports ({filteredReports.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        {filteredReports.length === 0 ? (
                            <div className="text-center py-8">
                                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {reports.length === 0 
                                        ? "No reports have been submitted yet."
                                        : "Try adjusting your filters to see more results."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredReports.map((r) => (
                                    <ReportCard key={r.id} report={r} adminMode={true} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}