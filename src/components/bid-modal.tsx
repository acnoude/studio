"use client";

import { useEffect, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { AuctionItem } from "@/lib/types";
import { placeBid } from "@/app/actions";
import { Gavel, Loader2, TriangleAlert } from "lucide-react";

interface BidModalProps {
  item: AuctionItem;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const bidFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amount: z.coerce.number()
});

type BidFormValues = z.infer<typeof bidFormSchema>;

export function BidModal({ item, isOpen, onOpenChange }: BidModalProps) {
  const [state, formAction, isPending] = useActionState(placeBid, null);
  const { toast } = useToast();

  const form = useForm<BidFormValues>({
    resolver: zodResolver(
      bidFormSchema.refine((data) => data.amount > item.currentBid, {
        message: `Your bid must be higher than the current bid of $${item.currentBid.toLocaleString()}.`,
        path: ["amount"],
      }).refine((data) => (data.amount - item.currentBid) % item.minIncrement === 0 || item.currentBid === item.startingBid, {
        message: `Bid must be in increments of $${item.minIncrement.toLocaleString()}. The next valid bid is $${item.currentBid + item.minIncrement}.`,
        path: ["amount"],
      })
    ),
    defaultValues: {
      name: "",
      email: "",
      amount: item.currentBid + item.minIncrement,
    },
  });

  useEffect(() => {
    if (state?.status === 'success') {
        toast({
            title: "Bid Placed!",
            description: state.message,
        });
        onOpenChange(false);
        form.reset();
    }
  }, [state, toast, onOpenChange, form]);
  
  // Reset form when modal opens
  useEffect(() => {
    if(isOpen) {
      form.reset({
        name: "",
        email: "",
        amount: item.currentBid + item.minIncrement,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Place Your Bid</DialogTitle>
          <DialogDescription>
            You are bidding on: <span className="font-semibold">{item.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="text-center bg-muted/50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-2xl sm:text-3xl font-bold font-headline text-accent">${item.currentBid.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Min Increment</p>
                    <p className="text-2xl sm:text-3xl font-bold font-headline text-accent">${item.minIncrement.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="itemId" value={item.id} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bid Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" className="pl-6" step={item.minIncrement} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {state?.status === 'error' && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Bidding Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent/90">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />}
                Submit Bid
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
