import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VerifyLoginForm from "@/components/auth/VerifyLoginForm";

export default function VerifyLogin() {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Verify it’s you
          </CardTitle>
          <CardDescription>
            Enter the code sent to your email to finish logging in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <VerifyLoginForm email={searchParams.get("email") ?? ""} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need to start again?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Return to log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
