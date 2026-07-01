// src/App.jsx
import React, { useState, useEffect } from 'react';

function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); 
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userProfile, setUserProfile] = useState(null); 

  // Core App States
  const [bins, setBins] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dynamic Map Coordinates (Defaults to Noida)
  const [mapCenter, setMapCenter] = useState({
    lat: "28.6272",
    lng: "77.3724",
    cityName: "Noida Grid"
  });

  const locationPresets = [
    { name: "📍 Noida (Tech Park)", lat: "28.6272", lng: "77.3724" },
    { name: "📍 Prayagraj (Sangam Hub)", lat: "25.4500", lng: "81.8400" },
    { name: "📍 Lucknow Central", lat: "26.8467", lng: "80.9462" },
    { name: "📍 Delhi NCR Matrix", lat: "28.6139", lng: "77.2090" }
  ];

  // 🛠️ Fixed to use 127.0.0.1 loopback for bulletproof routing
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://127.0.0.1:5000/api/bins')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setBins(data);
        })
        .catch((err) => console.log("Database status standby."));
    }
  }, [isLoggedIn]);

  // 🛠️ Fixed to use 127.0.0.1 loopback
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || (isRegisterMode && !name)) {
      return alert("Please fill out all visible fields.");
    }

    const endpoint = isRegisterMode ? '/api/users/register' : '/api/users/login';
    const payload = isRegisterMode ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (!response.ok) {
        return alert(data.error || data.message || "Authentication process failed.");
      }

      if (isRegisterMode) {
        alert("Registration complete! Switching to Sign In.");
        setIsRegisterMode(false);
        setName('');
      } else {
        setUserProfile(data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Failed to connect to backend authentication services.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setEmail('');
    setPassword('');
  };

  const handleLocationPresetChange = (preset) => {
    setMapCenter({
      lat: preset.lat,
      lng: preset.lng,
      cityName: preset.name
    });
  };

  // 🛠️ Fixed: Changed 'loading(true)' to 'setLoading(true)' and used 127.0.0.1
  const handleUploadAndScan = async () => {
    if (!selectedFile) return alert("Please select an image file first!");
    setLoading(true); 
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/recycle/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setScanResult(data);
    } catch (error) {
      console.error("Scanning failed:", error);
      alert("Could not connect to backend scanning bridge.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // VIEW 1: RENDER AUTHENTICATION INTERFACE IF LOGGED OUT
  // --------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-4xl">♻️</span>
            <h2 className="text-2xl font-bold text-slate-950 mt-2">
              {isRegisterMode ? "Create Eco Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode ? "Join the Smart E-Waste Matrix" : "Access the Smart E-Waste Management Hub"}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition text-sm mt-2 shadow-md"
            >
              {isRegisterMode ? "Register Account" : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)} 
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              {isRegisterMode ? "Already have an account? Sign In" : "Need an account? Register here"}
            </button>
          </div>

          <div className="mt-6 text-center text-[11px] text-slate-400">
            Secured deployment environment network portal.
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // VIEW 2: RENDER APPLICATION MAIN APP MODULE IF LOGGED IN
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-600 text-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-wide">♻️ EcoClean E-Waste Portal</h1>
          {userProfile && (
            <span className="text-[11px] text-emerald-100 mt-0.5">
              Logged in as: <span className="font-semibold">{userProfile.name}</span> | Balance: <span className="text-yellow-300 font-bold">{userProfile.ecoPoints} EcoPoints</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold">
            Active Grid: <span className="text-yellow-300 font-bold">{mapCenter.cityName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded-md font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid Panel Layout */}
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Image Scan Processor */}
        <section className="bg-white rounded-xl shadow p-6 border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">📸 AI Device Classifier</h2>
            <p className="text-sm text-slate-500 mb-6">Upload a photo of your obsolete device to safely catalog its components.</p>
            
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50 mb-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  setScanResult(null);
                }} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700"
              />
            </div>

            <button
              onClick={handleUploadAndScan}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              {loading ? "Analyzing Image Vectors..." : "Scan & Analyze Material"}
            </button>
          </div>

          {scanResult && (
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-bold text-emerald-900 mb-1">Device Identified: {scanResult.category}</h3>
              <p className="text-xs text-emerald-700">Confidence Rating: {(scanResult.confidence * 100).toFixed(1)}%</p>
            </div>
          )}
        </section>

        {/* Right Side: Embedded Mapping Engine + Location Selector Toggle */}
        <section className="bg-white rounded-xl shadow p-6 border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">📍 Live Smart Bin Track Map</h2>
            
            {/* Quick-Jump Manual Location Presets Bar */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Jump to Location Grid:</label>
              <div className="grid grid-cols-2 gap-2">
                {locationPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationPresetChange(preset)}
                    className={`text-left text-xs p-2 rounded-md border transition ${
                      mapCenter.cityName === preset.name
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Map Canvas Frame */}
            <div className="w-full h-[240px] rounded-xl overflow-hidden border border-slate-200 shadow-inner mb-4">
              <iframe
                title="Dynamic Location Tracker"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapCenter.lng)-0.04}%2C${parseFloat(mapCenter.lat)-0.02}%2C${parseFloat(mapCenter.lng)+0.04}%2C${parseFloat(mapCenter.lat)+0.02}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`}
              ></iframe>
            </div>
          </div>

          {/* Database Info Registries Logger */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 max-h-[120px] overflow-y-auto space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged Global Bins Index ({bins.length})</span>
            {bins.map((bin) => (
              <div key={bin._id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-[11px] shadow-sm">
                <div>
                  <span className="font-semibold text-slate-800 block">{bin.name}</span>
                  <span className="text-slate-400 text-[10px]">{bin.address}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase">
                  {bin.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;