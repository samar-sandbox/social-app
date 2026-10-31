import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/axios";
import { verifyOTPSchema } from "@/schema/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function ConfirmEmailForm({ email = "" }) {
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { email, otp: "" },
    resolver: zodResolver(verifyOTPSchema),
  });

  const handleConfirm = async ({ email, otp }) => {
    try {
      const { message, success } = await axiosInstance.post(
        "/auth/confirm-email",
        { email, otp },
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

  const handleResend = async () => {
    const isValidEmail = await trigger("email");
    if (!isValidEmail) return;

    try {
      setIsResending(true);

      const { message, success } = await axiosInstance.post(
        "/auth/resend-email",
        { email: getValues("email") },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleConfirm)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
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
          {...register("otp")}
        />
        {errors.otp && (
          <p className="text-sm text-destructive">{errors.otp.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isResending}
        className="w-full"
      >
        Confirm email
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting || isResending}
        onClick={handleResend}
        className="w-full"
      >
        {isResending ? "Sending..." : "Resend code"}
      </Button>
    </form>
  );
}
