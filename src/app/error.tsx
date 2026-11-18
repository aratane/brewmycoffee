"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container-artisan flex min-h-[65vh] flex-col items-center justify-center py-12 text-center">
      <span className="text-7xl">☕💦</span>
      <h1 className="heading-lg mt-6">Oops, we spilled the coffee!</h1>
      <p className="mt-3 max-w-md text-muted">Something went wrong on our end. Our bunny is mopping up — please try again in a moment.</p>
      <div className="mt-7 flex gap-3">
        <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
        <Link href="/"><Button variant="secondary">Back home</Button></Link>
      </div>
    </div>
  );
}
