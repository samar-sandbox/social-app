import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/axios";
import { resetPasswordSchema, verifyOTPSchema } from "@/schema/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function ResetPasswordForm({ email = "" }) {
  const [verifiedOtp, setVerifiedOtp] = useState(null);

  const navigate = useNavigate();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { email, otp: "", password: "", confirmPassword: "" },
    resolver: zodResolver(verifiedOtp ? resetPasswordSchema : verifyOTPSchema),
  });

  const handleVerifyOtp = async ({ email, otp }) => {
    try {
      const { message, success } = await axiosInstance.post(
        "/auth/forgot-password-verify",
        { email, otp },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        setVerifiedOtp(otp);
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  const handleResetPassword = async ({ password }) => {
    try {
      const { message, success } = await axiosInstance.post(
        "/auth/reset-password",
        {
          email,
          otp: verifiedOtp,
          password,
        },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        await navigate("/login");
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(
        verifiedOtp ? handleResetPassword : handleVerifyOtp,
      )}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          readOnly={Boolean(verifiedOtp)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="otp">Verification code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          aria-invalid={Boolean(errors.otp)}
          readOnly={Boolean(verifiedOtp)}
          {...register("otp")}
        />
        {errors.otp && (
          <p className="text-sm text-destructive">{errors.otp.message}</p>
        )}
      </div>

      {verifiedOtp && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {verifiedOtp ? "Reset password" : "Verify code"}
      </Button>
    </form>
  );
}
