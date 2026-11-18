import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-artisan flex min-h-[65vh] flex-col items-center justify-center py-12 text-center">
      <span className="text-8xl">🐰❓</span>
      <h1 className="heading-lg mt-6">This cup doesn't exist!</h1>
      <p className="mt-3 max-w-md text-muted">Buni looked everywhere but couldn't find that page. Let's get you back to the good stuff.</p>
      <Link href="/" className="mt-7"><Button size="lg"><ArrowLeft className="h-4 w-4" /> Back to the coffee shop</Button></Link>
    </div>
  );
}
