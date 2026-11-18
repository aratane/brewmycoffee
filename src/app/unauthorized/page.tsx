import Link from "next/link";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="container-artisan flex min-h-[65vh] flex-col items-center justify-center py-12 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cream text-mocha"><LockKeyhole className="h-9 w-9" /></span>
      <h1 className="heading-lg mt-6">Hmm, this area is staff-only.</h1>
      <p className="mt-3 max-w-md text-muted">You don't have permission to view this page. If you're on the team, ask your admin to update your role.</p>
      <Link href="/" className="mt-7"><Button size="lg"><ArrowLeft className="h-4 w-4" /> Back home</Button></Link>
    </div>
  );
}
