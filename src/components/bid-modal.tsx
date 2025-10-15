
"use client";

import { useState, useEffect, useActionState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
import { placeBid, createSetupIntent } from "@/app/actions";
import { Gavel, Loader2, TriangleAlert, CreditCard } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface BidModalProps {
  item: AuctionItem;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const BidModalWrapper = (props: BidModalProps) => {
  return (
    <Elements stripe={stripePromise}>
      <BidModal {...props} />
    </Elements>
  );
};

const BIDDER_INFO_KEY = "silentbid-bidder-info";

// Step 1: Pre-authorization form for Stripe
const PreAuthForm = ({
  onAuthSuccess,
  item,
}: {
  onAuthSuccess: (customerId: string) => void;
  item: AuctionItem;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(BIDDER_INFO_KEY);
      if (savedInfo) {
        const { name, email } = JSON.parse(savedInfo);
        setName(name || "");
        setEmail(email || "");
      }
    } catch(e) {
        console.error("Could not retrieve bidder info", e);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not ready yet. Please try again in a moment.");
      setLoading(false);
      return;
    }
    
    if (!email) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
    }

    // Save user info to local storage
    try {
        localStorage.setItem(BIDDER_INFO_KEY, JSON.stringify({ name, email }));
    } catch (e) {
        console.error("Could not save bidder info", e);
    }

    // Create a SetupIntent on the server
    const intentResponse = await createSetupIntent(email);

    if (intentResponse.error || !intentResponse.clientSecret) {
      setError(intentResponse.error || "Could not create a payment setup.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        setError("Card details not found.");
        setLoading(false);
        return;
    }
    
    // Confirm the card setup
    const { error: setupError } = await stripe.confirmCardSetup(
      intentResponse.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { email: email, name: name },
        },
      }
    );

    if (setupError) {
      setError(setupError.message || "An unexpected error occurred during card setup.");
      setLoading(false);
    } else {
      onAuthSuccess(intentResponse.customerId!);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
            <h3 className="font-semibold text-lg">Verify Card to Bid</h3>
            <p className="text-sm text-muted-foreground">
                We require a valid card on file to place bids. Your card will not be charged.
            </p>
        </div>
         <div className="space-y-2">
             <Label htmlFor="name">Full Name</Label>
             <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
         </div>
         <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" required />
         </div>
         <div className="space-y-2">
             <Label>Card Details</Label>
            <div className="p-2.5 border rounded-md">
                <CardElement options={cardElementOptions} />
            </div>
         </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter className="sticky bottom-0 bg-background pt-4 p-6 sm:px-6 px-0 border-t mt-4 -mx-6 sm:-mx-6 -mb-6">
        <Button type="submit" disabled={!stripe || loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Verify and Continue
        </Button>
      </DialogFooter>
    </form>
  );
};


const bidFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amount: z.coerce.number(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
  stripeCustomerId: z.string().optional(),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

// Step 2: The actual bid form (shown after pre-auth)
const BidForm = ({ item, customerId }: { item: AuctionItem, customerId: string }) => {
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
      amount: item.currentBid === item.startingBid ? item.startingBid : item.currentBid + item.minIncrement,
      terms: false,
      stripeCustomerId: customerId
    },
  });

  useEffect(() => {
    if (state?.status === 'success') {
        const { name, email } = form.getValues();
        try {
          const info = { name, email, stripeCustomerId: customerId };
          localStorage.setItem(BIDDER_INFO_KEY, JSON.stringify(info));
        } catch (error) {
          console.error("Could not save bidder info to localStorage", error);
        }
        toast({
            title: "Bid Placed!",
            description: state.message,
        });
    } else if (state?.status === 'error') {
        form.reset(form.getValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  
  useEffect(() => {
    let bidderInfo = { name: "", email: "", stripeCustomerId: customerId };
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
      stripeCustomerId: customerId
    };
    
    form.reset(newDefaultValues);
  }, [item, form, customerId]);

  return (
     <Form {...form}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="itemId" value={item.id} />
        <input type="hidden" name="stripeCustomerId" value={customerId} />

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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
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
                    By placing this bid, you are entering into a binding contract. If you are the winning bidder, you are obligated to purchase the item at the price of your winning bid. A valid payment method is required to place a bid. All sales are final. Items are sold as-is.
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
  )
}

function BidModal({ item, isOpen, onOpenChange }: BidModalProps) {
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedInfo = localStorage.getItem(BIDDER_INFO_KEY);
        if (savedInfo) {
          const info = JSON.parse(savedInfo);
          if (info.stripeCustomerId) {
            setCustomerId(info.stripeCustomerId);
          } else {
            setCustomerId(null);
          }
        } else {
            setCustomerId(null);
        }
      } catch (error) {
        console.error("Could not retrieve bidder info from localStorage", error);
        setCustomerId(null);
      }
    }
  }, [isOpen]);
  
  const handleAuthSuccess = (newCustomerId: string) => {
    setCustomerId(newCustomerId);
     try {
        const savedInfo = localStorage.getItem(BIDDER_INFO_KEY);
        const info = savedInfo ? JSON.parse(savedInfo) : {};
        info.stripeCustomerId = newCustomerId;
        localStorage.setItem(BIDDER_INFO_KEY, JSON.stringify(info));
    } catch (error) {
        console.error("Could not save customer ID to localStorage", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">Place Your Bid</DialogTitle>
          <DialogDescription>
            You are bidding on: <span className="font-semibold">{item.name}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="grid gap-4 px-6 overflow-y-auto">
          {customerId ? (
            <BidForm item={item} customerId={customerId} />
          ) : (
            <PreAuthForm onAuthSuccess={handleAuthSuccess} item={item} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export { BidModalWrapper as BidModal };
