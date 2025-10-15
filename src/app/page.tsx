import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ItemGrid } from "@/components/item-grid";
import { Logo } from "@/components/logo";
import { BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <Link href="/">
            <Logo />
          </Link>
           <div className="flex items-center gap-2">
             <Button asChild variant="ghost" size="sm">
                <Link href="/leaderboard">Leaderboard</Link>
             </Button>
            <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Silent Auction
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our curated collection of exclusive items. Place your bids and support a great cause.
            </p>
          </div>
          <ItemGrid />
        </section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col h-24 items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SilentBid. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Developer: Sigma Software Vertex | For issues contact:{" "}
            <a
              href="mailto:support@sigmasoftware.com"
              className="underline hover:text-foreground"
            >
              support@sigmasoftware.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
