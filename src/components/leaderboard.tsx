"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuctionItem } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

export function Leaderboard() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
        collection(db, "items"), 
        where("active", "==", true),
        orderBy("active"), // Explicitly order by the filtered field
        orderBy("currentBid", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData: AuctionItem[] = [];
        querySnapshot.forEach((doc) => {
          itemsData.push({ id: doc.id, ...doc.data() } as AuctionItem);
        });
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching items: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-headline">The Auction is Quiet...</h2>
            <p className="text-muted-foreground mt-2">No active items are available right now. Check back soon!</p>
        </div>
    )
  }

  return (
    <Card>
        <CardContent className="p-0">
            <div className="flow-root">
                <div className="-my-4 divide-y divide-border">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4">
                            <div className="flex-shrink-0">
                                <span className="text-xl font-bold text-muted-foreground w-8 text-center">
                                    {index + 1}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {item.highestBidderName ? `Bid by ${item.highestBidderName}`: 'No bids yet'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold font-headline text-accent">
                                    ${item.currentBid.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
