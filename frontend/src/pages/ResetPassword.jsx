import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Reset your password
          </CardTitle>
          <CardDescription>
            Verify the code sent to your email, then choose a new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResetPasswordForm email={searchParams.get("email") ?? ""} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Return to{" "}
            <Link to="/login" className="text-primary hover:underline">
              log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
