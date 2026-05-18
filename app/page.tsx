"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAppId } from "@/lib/chat/app-id";
import { appPath } from "@/lib/chat/routes";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(appPath(getStoredAppId()));
  }, [router]);

  return (
    <main className="flex h-dvh items-center justify-center text-muted-foreground text-sm">
      加载中…
    </main>
  );
}
