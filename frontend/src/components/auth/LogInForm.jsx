import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/axios";
import { loginSchema } from "@/schema/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "../ui/toast";

export default function LogInForm() {
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const email = watch("email");

  const handleLogin = async (formData) => {
    try {
      const { success, message, data, twoStepVerificationEnabled } =
        await axiosInstance.post("auth/login", formData);

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (!success) return;

      if (twoStepVerificationEnabled) {
        await navigate(
          `/verify-login?email=${encodeURIComponent(formData.email)}`,
        );
      } else {
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

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        <div className="flex justify-between">
          <Link
            to={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="block text-right text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            to="/confirm-email"
            className="block text-right text-xs text-primary hover:underline"
          >
            Confirm Email
          </Link>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Log in
      </Button>
    </form>
  );
}
