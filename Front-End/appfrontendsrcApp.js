import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./components/HomePage";
import JobListings from "./components/JobListings";
import JobDetail from "./components/JobDetail";
import ApplyJob from "./components/ApplyJob";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import SourceCodeViewer from "./components/SourceCodeViewer";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || !user.is_admin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/source-code"
            element={
              <ProtectedRoute>
                <SourceCodeViewer user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;