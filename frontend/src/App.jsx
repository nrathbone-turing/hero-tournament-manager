// File: frontend/src/App.jsx
// Purpose: Root component for React app.
// Notes:
// - Wraps app in AuthProvider for global state.
// - Navbar provides the global top-level title and auth buttons.
// - Each route component is responsible for its own page heading.

import { Routes, Route } from "react-router-dom";
import EventDashboard from "./components/EventDashboard";
import EventDetail from "./components/EventDetail";
import NotFoundPage from "./components/NotFoundPage";
import ServerErrorPage from "./components/ServerErrorPage";
import AuthProvider from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

function App() {
  return (
    <AuthProvider>
      <div>
        {/* Global top header */}
        <Navbar />

        {/* Route-specific content */}
        <Routes>
          <Route path="/" element={<EventDashboard />} />
          <Route path="/events/:id" element={<EventDetail />} />
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
