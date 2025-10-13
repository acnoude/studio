import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ItemGrid } from "@/components/item-grid";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <Logo />
          <Button asChild variant="ghost">
            <Link href="/admin">Admin Login</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto p-4 md:p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Welcome to the Silent Auction
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
            Developer: anu devara | For issues contact:{" "}
            <a
              href="mailto:anu.devara@vertex.sigma.software"
              className="underline hover:text-foreground"
            >
              anu.devara@vertex.sigma.software
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
