import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileButton from "./profile/ProfileButton";
import { axiosInstance } from "@/axios";
import { toast } from "./ui/toast";

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(false);

  const isAuthed = Boolean(localStorage.getItem("access_token"));

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      await axiosInstance.post("/auth/logout");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      await navigate("/login");
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-display text-lg">Social App</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <ProfileButton />
              <Button onClick={handleLogout}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading..
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
