
"use client";

import { useEffect, useMemo } from "react";
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
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import { useActionState } from "react";

const BIDDER_INFO_KEY = "silentbid-bidder-info";

interface BidModalProps {
  item: AuctionItem;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const bidFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amount: z.coerce.number(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

export function BidModal({ item, isOpen, onOpenChange }: BidModalProps) {
  const [state, formAction, isPending] = useActionState(placeBid, null);
  const { toast } = useToast();

  const dynamicResolver = useMemo(() => {
    return zodResolver(
      bidFormSchema.refine((data) => data.amount > item.currentBid, {
        message: `Your bid must be higher than the current bid of $${item.currentBid.toLocaleString()}.`,
        path: ["amount"],
      }).refine((data) => (data.amount - item.currentBid) % item.minIncrement === 0 || item.currentBid === item.startingBid, {
        message: `Bid must be in increments of $${item.minIncrement.toLocaleString()}. The next valid bid is $${(item.currentBid === item.startingBid ? item.startingBid : item.currentBid) + item.minIncrement}.`,
        path: ["amount"],
      })
    );
  }, [item.currentBid, item.minIncrement, item.startingBid]);

  const form = useForm<BidFormValues>({
    resolver: dynamicResolver,
    defaultValues: {
      name: "",
      email: "",
      amount: item.currentBid + item.minIncrement,
      terms: false,
    },
  });

  useEffect(() => {
    if (state?.status === 'success') {
        const { name, email } = form.getValues();
        try {
          localStorage.setItem(BIDDER_INFO_KEY, JSON.stringify({ name, email }));
        } catch (error) {
          console.error("Could not save bidder info to localStorage", error);
        }
        toast({
            title: "Bid Placed!",
            description: state.message,
        });
        onOpenChange(false);
    } else if (state?.status === 'error') {
        form.reset(form.getValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, onOpenChange, toast]);

  useEffect(() => {
    if (isOpen) {
      let bidderInfo = { name: "", email: "" };
      try {
        const savedInfo = localStorage.getItem(BIDDER_INFO_KEY);
        if (savedInfo) {
          bidderInfo = JSON.parse(savedInfo);
        }
      } catch (error) {
        console.error("Could not retrieve bidder info from localStorage", error);
      }
      
      const newDefaultValues = {
        name: bidderInfo.name || "",
        email: bidderInfo.email || "",
        amount: item.currentBid === item.startingBid ? item.startingBid : item.currentBid + item.minIncrement,
        terms: false,
      };
      
      form.reset(newDefaultValues);
    }
  }, [isOpen, item, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">Place Your Bid</DialogTitle>
          <DialogDescription>
            You are bidding on: <span className="font-semibold text-primary">{item.name}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="grid gap-4 px-6 overflow-y-auto">
          <Form {...form}>
            <form
              action={(formData) => {
                form.handleSubmit(() => {
                  // FormData needs 'amount' as a string
                  formData.set('amount', form.getValues('amount').toString());
                  formAction(formData);
                })();
              }}
              className="space-y-4"
            >
              <input type="hidden" name="itemId" value={item.id} />
              
              <div className="text-center bg-muted/50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Current Bid</p>
                          <p className="text-2xl sm:text-3xl font-bold font-headline text-primary">${item.currentBid.toLocaleString()}</p>
                      </div>
                      <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Min Increment</p>
                          <p className="text-2xl sm:text-3xl font-bold font-headline text-primary">${item.minIncrement.toLocaleString()}</p>
                      </div>
                  </div>
              </div>

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
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} name="terms" />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" className="underline hover:text-primary">
                          terms and conditions
                        </Link>
                        .
                      </FormLabel>
                      <ScrollArea className="h-24 w-full pr-4">
                        <p className="text-xs text-muted-foreground">
                          By placing this bid, you are entering into a binding contract. If you are the winning bidder, you are obligated to purchase the item at the price of your winning bid. All sales are final. Items are sold as-is.
                        </p>
                      </ScrollArea>
                      <FormMessage />
                    </div>
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

              <DialogFooter className="sticky bottom-0 bg-background pt-4 p-6 border-t -mx-6">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />}
                  Submit Bid
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    