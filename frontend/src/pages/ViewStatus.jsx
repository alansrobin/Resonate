import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext'; 

const API_BASE = "http://localhost:8000";

// ---
// Moved helper functions to the top level of the file
// to ensure they are available in the component's scope.
// ---

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'new': return <ExclamationTriangleIcon className="h-5 w-5" />;
    case 'acknowledged': return <ClockIcon className="h-5 w-5" />;
    case 'in_progress': return <ClockIcon className="h-5 w-5" />;
    case 'resolved': return <CheckCircleIcon className="h-5 w-5" />;
    default: return <ClockIcon className="h-5 w-5" />;
  }
};

const formatStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'new': return 'New';
    case 'acknowledged': return 'Acknowledged';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    default: return status || 'Unknown';
  }
};

// Department mapping
const getDepartmentName = (assignedTo) => {
  const deptMap = {
    2: "Public Works Department",
    3: "Streetlight Department",
    4: "Garbage Department"
  };
  return deptMap[assignedTo] || `Department ${assignedTo}`;
};

// Urgency level mapping
const getUrgencyColor = (score) => {
  if (score >= 4.5) return 'bg-red-100 text-red-800 border-red-200';
  if (score >= 3.5) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (score >= 2.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 1.5) return 'bg-blue-100 text-blue-800 border-blue-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

// --- FIX APPLIED HERE ---
const getUrgencyText = (score) => {
  switch (true) {
    case (score === 0):
      return 'No votes';
    case (score >= 4.5):
      return 'Critical';
    case (score >= 3.5):
      return 'High';
    case (score >= 2.5):
      return 'Medium';
    case (score >= 1.5):
      return 'Low';
    default:
      return 'Votes'; // This will catch any score > 0 but < 1.5
  }
};

export default function ViewStatus() {
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allReports, setAllReports] = useState([]);
  const [showAllReports, setShowAllReports] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [userVote, setUserVote] = useState(null); 

  const { user } = useAuth(); 

  // WebSocket for real-time updates
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.warn("User data not found. WebSocket connection skipped.");
      return;
    }
    const { access_token, role } = JSON.parse(userData);
    
    // Only connect to the admin WebSocket if the user is an admin
    if (role !== 'admin') {
      console.warn("User is not an admin. WebSocket connection skipped.");
      return;
    }

    const ws = new WebSocket(`${API_BASE}/ws/admin?token=${access_token}`);
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "report_updated" && report && msg.report.id === report.id) {
          setReport(msg.report);
        }
      } catch (err) {
        console.error("WS message parse error", err);
      }
    };

    return () => {
      try { ws.close(); } catch (e) {}
    };
  }, [report]);

  // UseEffect to update the user's vote when the report object changes
  useEffect(() => {
    if (report && user) {
        const foundVote = report.urgency_votes?.find(v => v.user_id === user.id);
        setUserVote(foundVote ? foundVote.vote : null);
    }
  }, [report, user]);

  const searchReport = async () => {
    if (!reportId.trim()) {
      setError('Please enter a report ID');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);
    setUserVote(null); 

    const token = user?.access_token;
    if (!token) {
      setError('You must be logged in to view reports.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/reports/${reportId.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Report not found. Please check the ID and try again.');
        } else if (res.status === 401) {
          setError('Unauthorized. Please log in.');
        } else {
          throw new Error('Failed to fetch report');
        }
      } else {
        const foundReport = await res.json();
        setReport(foundReport);
      }
    } catch (err) {
      setError('Error fetching report. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    setLoading(true);
    setError('');
    const token = user?.access_token;
    if (!token) {
      setError('You must be logged in to view reports.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/reports/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('Unauthorized. Please log in.');
        } else {
          throw new Error('Failed to fetch reports');
        }
      }
      const reports = await res.json();
      setAllReports(reports);
      setShowAllReports(true);
    } catch (err) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const voteUrgency = async (reportId, urgencyLevel) => {
    setVotingLoading(true);
    setError('');
    const token = user?.access_token;
    if (!token) {
        setError('You must be logged in to vote.');
        setVotingLoading(false);
        return;
    }
    
    try {
      const formData = new FormData();
      formData.append('urgency_level', urgencyLevel);
      
      const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}/vote`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Failed to vote');
      }
      
      const result = await res.json();
      
      if (report && report.id === reportId) {
        setReport(result.report);
      }
      
      setAllReports(prev => prev.map(r => 
        r.id === reportId ? result.report : r
      ));

      // Set the user's vote locally after a successful vote
      setUserVote(urgencyLevel);
      
    } catch (err) {
      setError(err.message || 'Error voting on urgency. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setVotingLoading(false);
    }
  };

  const isButtonActive = (level) => userVote !== null && level === userVote;
  const isButtonDisabled = (level) => votingLoading || (userVote !== null && level !== userVote);

  const getButtonClass = (level) => {
    const baseClasses = 'px-4 py-2 rounded-lg border text-sm font-medium transition-colors';
    const activeClasses = {
      1: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600',
      2: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
      3: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600',
      4: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600',
      5: 'bg-red-500 hover:bg-red-600 text-white border-red-600'
    };
    const inactiveClasses = {
      1: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 opacity-50',
      2: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 opacity-50',
      3: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 opacity-50',
      4: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 opacity-50',
      5: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 opacity-50'
    };
    const defaultClasses = {
      1: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
      2: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
      3: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200',
      4: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
      5: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
    };
  
    if (userVote === null) {
      return `${baseClasses} ${defaultClasses[level]}`;
    }
    
    return isButtonActive(level) 
      ? `${baseClasses} ${activeClasses[level]}`
      : `${baseClasses} ${inactiveClasses[level]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
            <MagnifyingGlassIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
          <p className="text-gray-600">Enter your complaint ID to check its current status</p>
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-500 mt-2 inline-block">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  placeholder="Enter your complaint ID (e.g., 60c72b2f9f1b4c3e8a4a5b6c)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && searchReport()}
                />
              </div>
              <button
                onClick={searchReport}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadAllReports}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Or view all recent reports
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {report && !showAllReports && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    #{report.id} - {report.title}
                  </h2>
                  <p className="text-gray-600">{report.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-2">{formatStatus(report.status)}</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(report.urgency_score || 0)}`}>
                    <span>🚨 {getUrgencyText(report.urgency_score || 0)}</span>
                    {report.urgency_votes_count > 0 && (
                      <span className="ml-2 text-xs">({report.urgency_votes_count} votes)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Complaint Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">{report.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="font-medium">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {report.updated_at !== report.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(report.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {report.assigned_to && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned to:</span>
                        <span className="font-medium">{getDepartmentName(report.assigned_to)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {report.photo_url && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Photo Evidence</h3>
                    <img
                      src={`${API_BASE}${report.photo_url}`}
                      alt="Issue"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">How urgent is this issue?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Help prioritize this issue by voting on its urgency level.
                  {report.urgency_votes_count > 0 && (
                    <span className="ml-2 font-medium">
                      Current urgency: {getUrgencyText(report.urgency_score || 0)} 
                      ({report.urgency_score?.toFixed(1)} / 5.0 from {report.urgency_votes_count} votes)
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const labels = {
                      1: 'Low Priority',
                      2: 'Moderate',
                      3: 'Important', 
                      4: 'Urgent',
                      5: 'Critical'
                    };
                    
                    return (
                      <button
                        key={level}
                        onClick={() => voteUrgency(report.id, level)}
                        disabled={isButtonDisabled(level)}
                        className={getButtonClass(level)}
                      >
                        {level} - {labels[level]}
                      </button>
                    );
                  })}
                </div>
                {votingLoading && (
                  <p className="text-sm text-blue-600 mt-2">Submitting your vote...</p>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Status Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">Report Submitted</p>
                      <p className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {report.status !== 'new' && (
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        report.status === 'acknowledged' || report.status === 'in_progress' || report.status === 'resolved' 
                          ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        <ClockIcon className={`h-4 w-4 ${
                          report.status === 'acknowledged' || report.status === 'in_progress' || report.status === 'resolved'
                            ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Report Acknowledged</p>
                        {report.assigned_to && (
                          <p className="text-xs text-gray-500">
                            Assigned to {getDepartmentName(report.assigned_to)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {report.status === 'in_progress' && (
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                        <ClockIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Work In Progress</p>
                        <p className="text-xs text-gray-500">Resolution is underway</p>
                      </div>
                    </div>
                  )}

                  {report.status === 'resolved' && (
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Issue Resolved</p>
                        <p className="text-xs text-gray-500">Thank you for your report</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showAllReports && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
              <button
                onClick={() => setShowAllReports(false)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Search
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {allReports.map((r) => (
                <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          #{r.id} - {r.title}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                          {getStatusIcon(r.status)}
                          <span className="ml-1">{formatStatus(r.status)}</span>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(r.urgency_score || 0)}`}>
                          <span>🚨 {getUrgencyText(r.urgency_score || 0)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{r.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Category: {r.category}</span>
                        <span>Submitted: {new Date(r.created_at).toLocaleDateString()}</span>
                        {r.assigned_to && (
                          <span>Assigned to: {getDepartmentName(r.assigned_to)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReport(r);
                        setShowAllReports(false);
                        setReportId(r.id.toString());
                      }}
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}