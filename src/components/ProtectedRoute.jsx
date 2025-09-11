import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthCtx";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <span className="loader"></span>;

  return user ? children : <Navigate to="/login" replace />;
}
