import { redirect } from "next/navigation";
import { readCurrentUser } from "@/lib/currentUser";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

export default async function LandingRoute({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();

  // Signed-in visitors land straight into the app.
  if (user?.isSignedIn) {
    redirect("/home");
  }

  return (
    <>
      {sp.auth_error && (
        <div className="mb-6">
          <AuthErrorBanner code={sp.auth_error} />
        </div>
      )}
      <LandingPage />
    </>
  );
}
