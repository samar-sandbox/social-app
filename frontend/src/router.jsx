import { createBrowserRouter } from "react-router";
import GuestRoute from "./components/routes/GuestRoute";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import Signup from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyLogin from "./pages/VerifyLogin";
import Home from "./pages/Home";
import PageLayout from "./Layout";

const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "*",
            element: <Home />,
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          { path: "/signup", element: <Signup /> },
          { path: "/login", element: <LogIn /> },
          { path: "/confirm-email", element: <ConfirmEmail /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/reset-password", element: <ResetPassword /> },
          { path: "/verify-login", element: <VerifyLogin /> },
        ],
      },
    ],
  },
]);

export default router;
