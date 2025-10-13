"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuctionItem } from "@/lib/types";
import { BidModal } from "@/components/bid-modal";
import { Gavel } from "lucide-react";

interface ItemCardProps {
  item: AuctionItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="aspect-[3/2] relative">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              data-ai-hint="auction item"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-6">
          <CardTitle className="font-headline text-2xl mb-2">{item.name}</CardTitle>
          <CardDescription className="flex-1">{item.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 p-6 pt-0">
          <div>
            <p className="text-sm text-muted-foreground">Current Bid</p>
            <p className="text-3xl font-bold font-headline text-accent">
              ${item.currentBid.toLocaleString()}
            </p>
          </div>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setIsBidModalOpen(true)}
          >
            <Gavel className="mr-2 h-4 w-4" />
            Place Bid
          </Button>
        </CardFooter>
      </Card>
      <BidModal
        item={item}
        isOpen={isBidModalOpen}
        onOpenChange={setIsBidModalOpen}
      />
    </>
  );
}

export function ItemCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[3/2] w-full" />
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 p-6 pt-0">
        <div className="w-full">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
