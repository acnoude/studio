import { Leaderboard } from "@/components/leaderboard";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LeaderboardPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between p-4">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <Button asChild variant="ghost">
                        <Link href="/">Back to Bidding</Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1">
                <section className="container mx-auto p-4 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">
                            Live Leaderboard
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Tracking the latest bids in real-time.
                        </p>
                    </div>
                    <Leaderboard />
                </section>
            </main>
             <footer className="border-t">
                <div className="container mx-auto flex h-16 items-center justify-center p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} SilentBid. All rights reserved.
                </p>
                </div>
            </footer>
        </div>
    )
}