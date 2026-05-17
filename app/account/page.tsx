import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountProfile } from "@/components/auth/account-profile";
import { requireUser } from "@/lib/auth/require-user";
import { getDisplayUsername } from "@/lib/auth/username";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Button variant="ghost" size="sm" className="-ms-2 gap-1.5" asChild>
          <Link href="/">
            <ArrowLeftIcon className="size-4" />
            返回对话
          </Link>
        </Button>
        <AccountProfile
          user={user}
          displayName={getDisplayUsername(user)}
        />
      </div>
    </main>
  );
}
