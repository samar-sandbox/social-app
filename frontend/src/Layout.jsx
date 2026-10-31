import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";

export default function PageLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 px-3 py-5">
        <Outlet />
      </div>
    </div>
  );
}
