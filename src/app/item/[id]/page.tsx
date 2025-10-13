"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuctionItem } from "@/lib/types";
import { BidModal } from "@/components/bid-modal";
import { ItemCard, ItemCardSkeleton } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "items", id);
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setItem({ id: doc.id, ...doc.data() } as AuctionItem);
        } else {
          console.error("No such document!");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching document: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <ItemCardSkeleton />
        </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-headline">Item not found</h2>
        <p className="text-muted-foreground mt-2">
          The item you are looking for does not exist or may have been removed.
        </p>
         <Button asChild variant="link" className="mt-4">
            <Link href="/">Back to Auction</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <Logo />
          <Button asChild variant="ghost">
            <Link href="/admin">Admin Login</Link>
          </Button>
        </div>
      </header>
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="aspect-[3/2] relative rounded-lg overflow-hidden">
                 <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
            <div className="flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{item.name}</h1>
                <p className="text-lg text-muted-foreground mb-8">{item.description}</p>
                
                <div className="bg-muted/50 p-6 rounded-lg mb-8">
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-5xl font-bold font-headline text-accent">
                        ${item.currentBid.toLocaleString()}
                    </p>
                </div>

                <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => setIsBidModalOpen(true)}
                    >
                    <Gavel className="mr-2 h-5 w-5" />
                    Place Your Bid
                </Button>
            </div>
          </div>
        </main>
      </div>
      <BidModal
        item={item}
        isOpen={isBidModalOpen}
        onOpenChange={setIsBidModalOpen}
      />
    </>
  );
}
