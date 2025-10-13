"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuctionItem } from "@/lib/types";
import QRCode from "qrcode.react";

interface QrCodeModalProps {
  item: AuctionItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function QrCodeModal({ item, isOpen, onOpenChange }: QrCodeModalProps) {
  if (!item) return null;

  const itemUrl = `${window.location.origin}/item/${item.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            QR Code for {item.name}
          </DialogTitle>
          <DialogDescription>
            Scan this code to go directly to the item's bidding page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-md">
            <QRCode value={itemUrl} size={256} level="H" />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground break-all">{itemUrl}</p>
      </DialogContent>
    </Dialog>
  );
}
