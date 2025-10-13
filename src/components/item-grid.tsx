"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuctionItem } from "@/lib/types";
import { ItemCard, ItemCardSkeleton } from "@/components/item-card";

export function ItemGrid() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "items"), where("active", "==", true));
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-headline">No Active Items</h2>
            <p className="text-muted-foreground mt-2">The auction is not currently active or no items have been added yet. Please check back later.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
