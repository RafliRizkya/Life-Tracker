"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReflectionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/compass");
  }, [router]);
  return null;
}
