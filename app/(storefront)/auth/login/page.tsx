import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestLoginOtpAction } from "@/actions/auth-actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone: "Enter a valid 10-digit mobile number.",
  rate_limited: "Too many OTP requests. Please try again in a while.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>We&apos;ll send a one-time code to your phone.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={requestLoginOtpAction} className="space-y-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-9 items-center rounded-md border border-border/60 px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  maxLength={10}
                  required
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">{ERROR_MESSAGES[error] ?? "Something went wrong."}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Send OTP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
