import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { CameraIcon, MapPinIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8000"; // backend URL

export default function SubmitReport() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("pothole");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loc, setLoc] = useState({ lat: 0.0, lng: 0.0 });
  const [locationFromPhoto, setLocationFromPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(null);

  // try to get real geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (err) => {
          console.warn("Geolocation failed:", err.message);
          // fallback to Jharkhand coordinates
          setLoc({ lat: 23.6102, lng: 85.2799 });
        }
      );
    } else {
      // Default to Jharkhand coordinates
      setLoc({ lat: 23.6102, lng: 85.2799 });
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Get fresh location when photo is uploaded
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
            setLocationFromPhoto(true);
          },
          (err) => {
            console.warn("Photo location detection failed:", err.message);
            // Keep existing location
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } else {
      setPhoto(null);
      setPhotoPreview(null);
      setLocationFromPhoto(false);
    }
  };

  async function submit(e) {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", desc || "");
    fd.append("category", cat);
    fd.append("lat", loc.lat ?? 0);
    fd.append("lng", loc.lng ?? 0);
    if (photo) fd.append("photo", photo);

    try {
      const res = await fetch(`${API_BASE}/api/v1/reports/`, {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const body = await res.json();
        setReportId(body.id);
        setSubmitted(true);
        // Clear form
        setTitle("");
        setDesc("");
        setPhoto(null);
        setPhotoPreview(null);
        setCat("pothole");
      } else {
        let msg;
        try {
          const err = await res.json();
          msg = err.detail || JSON.stringify(err);
        } catch {
          msg = await res.text();
        }
        alert("Upload failed: " + msg);
        console.error("Upload failed", res.status, msg);
      }
    } catch (err) {
      alert("Network error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your complaint has been recorded with ID: <span className="font-semibold text-blue-600">#{reportId}</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You can use this ID to track your complaint status.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Another Report
              </button>
              <Link
                to="/status"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Track This Report
              </Link>
              <Link
                to="/"
                className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
            <DocumentPlusIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Complaint</h1>
          <p className="text-gray-600">Report civic issues in your area for quick resolution</p>
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-500 mt-2 inline-block">
            ← Back to Home
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={submit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Briefly describe the issue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Category *
              </label>
              <select
                id="category"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="pothole">🕳️ Pothole</option>
                <option value="streetlight">💡 Streetlight Issue</option>
                <option value="garbage">🗑️ Garbage Collection</option>
                <option value="drainage">🌊 Drainage Problem</option>
                <option value="road">🛣️ Road Maintenance</option>
                <option value="other">📝 Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Provide detailed information about the issue, including location details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <label htmlFor="photo" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">
                        Click to upload a photo
                      </span>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location Info */}
            <div className={`rounded-lg p-4 ${locationFromPhoto ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className={`flex items-center text-sm ${locationFromPhoto ? 'text-green-700' : 'text-blue-700'}`}>
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>
                  Location: {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                  {loc.lat === 23.6102 && loc.lng === 85.2799 && " (Default: Jharkhand)"}
                  {locationFromPhoto && " 📸 (From Photo)"}
                </span>
              </div>
              <p className={`text-xs mt-2 ${locationFromPhoto ? 'text-green-600' : 'text-blue-600'}`}>
                {locationFromPhoto 
                  ? "✅ Location updated from photo capture - this is where the photo was taken"
                  : "Location is automatically detected or set to Jharkhand by default"
                }
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !title}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
