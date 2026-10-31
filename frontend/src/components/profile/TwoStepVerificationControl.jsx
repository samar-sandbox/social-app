import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/axios";
import { verifyOTPSchema } from "@/schema/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function TwoStepVerificationControl({ user, onEnabled }) {
  const [otpRequested, setOtpRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { email: user.email, otp: "" },
    resolver: zodResolver(verifyOTPSchema),
  });

  const handleRequestOtp = async () => {
    try {
      setIsRequesting(true);

      const { success, message } = await axiosInstance.post(
        "/auth/two-step-verification",
        { email: user.email },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        setOtpRequested(true);
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEnable = async ({ email, otp }) => {
    try {
      const { success, message } = await axiosInstance.post(
        "/auth/enable-two-step-verification",
        { email, otp },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        onEnabled();
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  if (user.twoStepVerificationEnabled) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        Two-step verification is enabled for this account.
      </p>
    );
  }

  if (!otpRequested) {
    return (
      <div className="space-y-2 py-2">
        <p className="text-sm text-muted-foreground">
          Add a verification code sent to your email to protect future logins.
        </p>
        <Button
          type="button"
          onClick={handleRequestOtp}
          disabled={isRequesting}
          className="w-full"
        >
          {isRequesting ? "Sending code..." : "Enable two-step verification"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOtpRequested(true)}
          disabled={isRequesting}
          className="w-full"
        >
          Already have a code? Verify
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleEnable)} className="space-y-2 py-2">
      <p className="text-sm text-muted-foreground">
        Enter the verification code sent to {user.email}.
      </p>
      <input type="hidden" {...register("email")} />
      <div className="space-y-1.5">
        <Label htmlFor="two-step-otp">Verification code</Label>
        <Input
          id="two-step-otp"
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
      <Button type="submit" disabled={isSubmitting} className="w-full">
        Verify and enable
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleRequestOtp}
        disabled={isSubmitting}
        className="w-full"
      >
        {isRequesting ? "Sending code..." : "Resend code"}
      </Button>
    </form>
  );
}
