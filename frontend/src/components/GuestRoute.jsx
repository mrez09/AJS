import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/buyer" replace />;
  }

  return children;
}

export default GuestRoute;
