"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { doc, updateDoc, serverTimestamp, addDoc, collection, getDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebase/server";
import { validateBidForFraud } from "@/ai/flows/validate-bids-for-fraud";
import type { AuctionItem } from "@/lib/types";

const bidSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  amount: z.number().positive("Bid amount must be positive."),
  itemId: z.string(),
});

export async function placeBid(
  prevState: any,
  formData: FormData
) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    const parsedBid = bidSchema.safeParse({
        ...rawFormData,
        amount: Number(rawFormData.amount)
    });

    if (!parsedBid.success) {
      return {
        message: "Validation failed",
        errors: parsedBid.error.flatten().fieldErrors,
      };
    }
    
    const { name, email, amount, itemId } = parsedBid.data;

    const itemRef = doc(adminDb, "items", itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      return { message: "Item not found.", status: "error" };
    }

    const item = itemDoc.data() as AuctionItem;

    if (amount <= item.currentBid) {
      return { message: "Your bid must be higher than the current bid.", status: "error" };
    }

    // AI Fraud Detection
    const fraudCheckResult = await validateBidForFraud({
        bidAmount: amount,
        userEmail: email,
        userName: name,
        itemDescription: item.description,
        currentBid: item.currentBid,
    });

    if (fraudCheckResult.isFraudulent) {
        return {
            message: `Bid flagged as potentially fraudulent: ${fraudCheckResult.reason}`,
            status: "error",
        };
    }

    await updateDoc(itemRef, {
      currentBid: amount,
      highestBidderName: name,
      highestBidderEmail: email,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { message: "Bid placed successfully!", status: "success" };
  } catch (error) {
    console.error("Error placing bid:", error);
    return { message: "An unexpected error occurred. Please try again.", status: "error" };
  }
}

const itemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startingBid: z.number().min(0, 'Starting bid must be non-negative'),
    imageUrl: z.string().url('A valid image URL is required'),
});


export async function createItem(prevState: any, formData: FormData) {
    try {
        const rawFormData = {
            name: formData.get('name'),
            description: formData.get('description'),
            startingBid: Number(formData.get('startingBid')),
            imageUrl: formData.get('imageUrl'),
        }

        const parsed = itemSchema.safeParse(rawFormData);
        if (!parsed.success) {
            return { message: 'Invalid data', errors: parsed.error.flatten().fieldErrors };
        }

        const { name, description, startingBid, imageUrl } = parsed.data;

        await addDoc(collection(adminDb, "items"), {
            name,
            description,
            startingBid,
            imageUrl,
            currentBid: startingBid,
            highestBidderName: null,
            highestBidderEmail: null,
            createdAt: serverTimestamp(),
            active: true,
        });

        revalidatePath('/admin');
        revalidatePath('/');
        return { message: 'Item created successfully!', status: 'success' };
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create item', status: 'error' };
    }
}


export async function toggleItemStatus(id: string, active: boolean) {
    try {
        const itemRef = doc(adminDb, 'items', id);
        await updateDoc(itemRef, { active: active });
        revalidatePath('/admin');
        revalidatePath('/');
        return { message: `Item status updated.`, status: 'success' };
    } catch (error) {
        console.error('Error toggling item status', error);
        return { message: 'Failed to update item status.', status: 'error' };
    }
}

export async function toggleGalaStatus(active: boolean) {
    try {
        const itemsCollection = collection(adminDb, 'items');
        const querySnapshot = await itemsCollection.get();
        const batch = adminDb.batch();

        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { active });
        });

        await batch.commit();

        revalidatePath('/admin');
        revalidatePath('/');

        const status = active ? 'started' : 'stopped';
        return { message: `Gala has been ${status}. All items are now ${active ? 'active' : 'inactive'}.`, status: 'success' };
    } catch(error) {
        console.error('Error toggling gala status:', error);
        return { message: 'Failed to update gala status.', status: 'error' };
    }
}
