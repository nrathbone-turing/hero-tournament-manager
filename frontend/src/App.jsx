// File: frontend/src/App.jsx
// Purpose: Root component for React app.
// Notes:
// - Wraps app in AuthProvider for global state.
// - Protects Event routes with ProtectedRoute.

import { Routes, Route } from "react-router-dom";
import EventDashboard from "./components/EventDashboard";
import EventDetail from "./components/EventDetail";
import NotFoundPage from "./components/NotFoundPage";
import ServerErrorPage from "./components/ServerErrorPage";
import AuthProvider from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <EventDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
