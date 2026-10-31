import { axiosInstance } from "@/axios";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "../ui/toast";
import { useNavigate } from "react-router-dom";

export default function GoogleButton() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialData) => {
    try {
      const { success, message, data } = await axiosInstance.post(
        "/auth/google",
        credentialData,
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);

        await navigate("/");
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  const handleError = () => {
    toast.add({ type: "error", description: "Login Failed" });
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      text="continue_with"
    />
  );
}
