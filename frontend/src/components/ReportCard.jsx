import React, { useState } from "react";
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000";

const DEPT_MAP = {
    2: "Public Works",
    3: "Streetlight Dept",
    4: "Garbage Dept",
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'acknowledged': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
        case 'new': return <ExclamationTriangleIcon className="h-4 w-4" />;
        case 'acknowledged':
        case 'in_progress': return <ClockIcon className="h-4 w-4" />;
        case 'resolved': return <CheckCircleIcon className="h-4 w-4" />;
        default: return <ClockIcon className="h-4 w-4" />;
    }
};

export default function ReportCard({ report, adminMode = false }) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    async function assign(deptId) {
        try {
            setLoading(true);
            const res = await fetch(
                // Corrected URL path to match backend endpoint
                `${API_BASE}/api/v1/reports/admin/assign/${report.id}/${deptId}`,
                {
                    method: "POST",
                    // Corrected token variable name
                    headers: { "Authorization": `Bearer ${user?.access_token}` },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Assign failed");
            }
        } catch (err) {
            console.error("Assign error:", err);
            alert("Assign failed: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(newStatus) {
        try {
            setLoading(true);
            const res = await fetch(
                // Corrected URL path to match backend endpoint
                `${API_BASE}/api/v1/reports/admin/status/${report.id}/${newStatus}`,
                {
                    method: "POST",
                    // Corrected token variable name
                    headers: { "Authorization": `Bearer ${user?.access_token}` },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Status update failed");
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Status update failed: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    }

    async function removeReport() {
        // NOTE: You should create a custom modal for this instead of `confirm()`
        const ok = confirm("Delete this report? This cannot be undone.");
        if (!ok) return;
        try {
            setLoading(true);
            const res = await fetch(
                // Corrected URL path to match backend endpoint
                `${API_BASE}/api/v1/reports/admin/delete/${report.id}`,
                {
                    method: "DELETE",
                    // Corrected token variable name
                    headers: { "Authorization": `Bearer ${user?.access_token}` },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Delete failed");
            }
            alert("Deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Delete failed: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            #{report.id} {report.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{report.description}</p>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium capitalize text-gray-900">{report.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Submitted:</span>
                        <span className="font-medium text-gray-900">
                            {new Date(report.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    {report.assigned_to && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Assigned to:</span>
                            <span className="font-medium text-gray-900">
                                {DEPT_MAP[report.assigned_to] || `Dept ${report.assigned_to}`}
                            </span>
                        </div>
                    )}
                    {report.location && (
                        <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span>{report.location.lat?.toFixed(4)}, {report.location.lng?.toFixed(4)}</span>
                        </div>
                    )}
                </div>
                {report.photo_url && (
                    <div className="mb-4">
                        <img
                            src={`${API_BASE}${report.photo_url}`}
                            alt="Issue"
                            className="w-full h-48 object-cover rounded-lg shadow-sm"
                        />
                    </div>
                )}
                {adminMode && (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Assign to Department:</p>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    disabled={loading}
                                    onClick={() => assign(2)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Public Works
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => assign(3)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Streetlight
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => assign(4)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Garbage
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    disabled={loading}
                                    onClick={() => updateStatus("acknowledged")}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Acknowledge
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => updateStatus("in_progress")}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    In Progress
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => updateStatus("resolved")}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Resolve
                                </button>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            <button
                                disabled={loading}
                                onClick={removeReport}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Delete Report
                            </button>
                        </div>
                    </div>
                )}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            <span className="text-sm text-gray-600">Processing...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}