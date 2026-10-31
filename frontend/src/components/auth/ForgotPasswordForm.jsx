import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/axios";
import { sendOTPSchema } from "@/schema/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function ForgotPasswordForm({ email = "" }) {
  const navigate = useNavigate();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { email },
    resolver: zodResolver(sendOTPSchema),
  });

  const handleRequest = async ({ email }) => {
    try {
      const { message, success } = await axiosInstance.post(
        "/auth/forgot-password",
        { email },
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        await navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRequest)} className="space-y-4">
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Send reset code
      </Button>
    </form>
  );
}
