"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createItem } from "@/app/actions";
import { Loader2, PlusCircle } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  startingBid: z.coerce.number().min(0, "Starting bid must be non-negative"),
  image: z.any().refine((files) => files?.length === 1, "Image is required."),
});

export function CreateItemModal({ isOpen, onOpenChange }: CreateItemModalProps) {
  const [initialState, formAction] = useFormState(createItem, null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingBid: 10,
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setImageUploadLoading(true);
    try {
      const file = values.image[0];
      const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("startingBid", values.startingBid.toString());
      formData.append("imageUrl", downloadURL);
      
      formAction(formData);

    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: "Error", description: "Image upload failed.", variant: "destructive" });
    } finally {
      setImageUploadLoading(false);
    }
  };
  
  useEffect(() => {
    if(initialState?.status === 'success') {
        toast({ title: "Success", description: initialState.message });
        onOpenChange(false);
        form.reset();
    } else if (initialState?.status === 'error') {
        toast({ title: "Error", description: initialState.message, variant: 'destructive' });
    }
  }, [initialState, onOpenChange, toast, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loading = isSubmitting || imageUploadLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Create New Auction Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to the auction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vintage Leather Journal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item in detail..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startingBid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Bid</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Item Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
