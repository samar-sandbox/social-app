import { Navigate, Outlet } from "react-router";

export default function GuestRoute() {
  if (localStorage.getItem("access_token")) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
