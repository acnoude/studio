"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuctionItem } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Leaderboard() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
        collection(db, "items"), 
        where("active", "==", true),
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
        <Card className="text-center py-16 border-2 border-dashed rounded-lg bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">The Auction is Quiet...</CardTitle>
            <CardDescription className="mt-2">
              No active items are available right now. Check back soon!
            </CardDescription>
          </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Current Bid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-lg font-bold text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary font-mono">
                    ${item.currentBid.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
    </Card>
  );
}
