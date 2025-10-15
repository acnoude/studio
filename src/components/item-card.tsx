"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuctionItem } from "@/lib/types";
import { BidModal } from "@/components/bid-modal";

interface ItemCardProps {
  item: AuctionItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group border-0 shadow-none rounded-lg bg-card hover:shadow-xl">
        <CardContent className="p-0 flex flex-col flex-1">
          <Link href={`/item/${item.id}`} className="flex flex-col h-full">
            <div className="aspect-video relative w-full overflow-hidden rounded-t-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="auction item"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="flex-1 flex flex-col p-4">
              <h3 className="font-semibold text-base md:text-lg mb-2 flex-1">{item.name}</h3>
              <p className="text-sm font-medium text-muted-foreground">Current Bid</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                ${item.currentBid.toLocaleString()}
              </p>
            </div>
          </Link>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
              className="w-full"
              variant="default"
              onClick={() => setIsBidModalOpen(true)}
          >
              Place Bid
          </Button>
        </CardFooter>
      </Card>
      {isBidModalOpen && (
        <BidModal
            item={item}
            isOpen={isBidModalOpen}
            onOpenChange={setIsBidModalOpen}
        />
      )}
    </>
  );
}

export function ItemCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-0 shadow-none rounded-lg">
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-1/3" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
