import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verifyLoginOtpAction } from "@/actions/auth-actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "That code is incorrect. Please try again.",
  expired: "This code has expired. Request a new one.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; error?: string; next?: string }>;
}) {
  const { phone, error, next } = await searchParams;

  if (!phone) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <p className="text-sm text-muted-foreground">
          Missing phone number. Please <a className="underline" href="/auth/login">start over</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Enter your code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to {phone}.{" "}
            <span className="text-muted-foreground">
              (Check the server console — SMS is in dev mode.)
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={verifyLoginOtpAction} className="space-y-4">
            <input type="hidden" name="phone" value={phone} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoFocus
                required
              />
              {error ? (
                <p className="text-sm text-destructive">{ERROR_MESSAGES[error] ?? "Something went wrong."}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Verify &amp; continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
