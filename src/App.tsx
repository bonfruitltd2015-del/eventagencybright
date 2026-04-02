import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Scanner from "./pages/Scanner";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catlava" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/catlava/scan" element={<AdminRoute><Scanner /></AdminRoute>} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
