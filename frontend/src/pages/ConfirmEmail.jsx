import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmEmailForm from "@/components/auth/ConfirmEmailForm";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Confirm your email
          </CardTitle>
          <CardDescription>
            Enter the code we sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ConfirmEmailForm email={searchParams.get("email") ?? ""} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already confirmed?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
