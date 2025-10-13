import type { Timestamp } from "firebase/firestore";

export interface AuctionItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  startingBid: number;
  currentBid: number;
  minIncrement: number;
  highestBidderName: string | null;
  highestBidderEmail: string | null;
  createdAt: Timestamp;
  active: boolean;
}
