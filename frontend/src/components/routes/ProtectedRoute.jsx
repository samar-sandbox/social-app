import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  if (!localStorage.getItem("access_token")) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
}
