"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuctionItem, Bid } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2 } from "lucide-react";

interface BidHistoryModalProps {
  item: AuctionItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function BidHistoryModal({ item, isOpen, onOpenChange }: BidHistoryModalProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item?.id) return;

    setLoading(true);
    const bidsQuery = query(
      collection(db, "items", item.id, "bids"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(bidsQuery, (snapshot) => {
      const bidsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Bid));
      setBids(bidsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [item?.id]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Bid History for {item.name}
          </DialogTitle>
          <DialogDescription>
            A complete log of all bids placed on this item.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.length > 0 ? (
                  bids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>
                        <div className="font-medium">{bid.name}</div>
                        <div className="text-xs text-muted-foreground">{bid.email}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${bid.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {bid.createdAt?.toDate().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No bids have been placed on this item yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
