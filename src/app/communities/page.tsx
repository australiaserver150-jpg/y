
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CommunitiesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Communities</h1>
        <p className="text-muted-foreground mb-8">This is where group communities will be listed.</p>
        <Button asChild>
          <Link href="/chat" className="flex items-center gap-2">
            <ArrowLeft />
            <span>Back to Chat</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
