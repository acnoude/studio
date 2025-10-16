
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/server";
import { validateBidForFraud } from "@/ai/flows/validate-bids-for-fraud";
import type { AuctionItem } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const bidSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  amount: z.coerce.number().positive("Bid amount must be positive."),
  itemId: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  })
});

async function verifyAuth(token: string | null) {
  const adminAuth = getAdminAuth();
  if (!token) {
    throw new Error("Authentication token not provided.");
  }
  try {
    await adminAuth.verifyIdToken(token);
  } catch (error) {
    throw new Error("Invalid authentication token.");
  }
}

export async function placeBid(
  prevState: any,
  formData: FormData
) {
  try {
    const adminDb = getAdminDb();
    const rawFormData = Object.fromEntries(formData.entries());
    const parsedBid = bidSchema.safeParse({
        ...rawFormData,
        amount: Number(rawFormData.amount),
        terms: rawFormData.terms === 'on'
    });

    if (!parsedBid.success) {
      return {
        message: "Validation failed",
        errors: parsedBid.error.flatten().fieldErrors,
      };
    }
    
    const { name, email, amount, itemId } = parsedBid.data;

    const itemRef = adminDb.doc(`items/${itemId}`);
    
    const item = await adminDb.runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) {
            throw new Error(`Item with ID "${itemId}" not found.`);
        }

        const currentItem = itemDoc.data() as AuctionItem;

        if (amount <= currentItem.currentBid) {
            throw new Error("Your bid must be higher than the current bid.");
        }
        
        const fraudCheckResult = await validateBidForFraud({
            bidAmount: amount,
            userEmail: email,
            userName: name,
            itemDescription: currentItem.description,
            currentBid: currentItem.currentBid,
        });

        if (fraudCheckResult.isFraudulent) {
            throw new Error(`Bid flagged as potentially fraudulent: ${fraudCheckResult.reason}`);
        }
        
        // Update the main item document within the transaction
        transaction.update(itemRef, {
          currentBid: amount,
          highestBidderName: name,
          highestBidderEmail: email,
        });

        // Add a record to the bids subcollection (can't use batch in transaction)
        const bidRef = itemRef.collection('bids').doc();
        transaction.set(bidRef, {
            name,
            email,
            amount,
            createdAt: FieldValue.serverTimestamp(),
            itemId,
        });

        return currentItem;
    });


    revalidatePath("/");
    revalidatePath(`/item/${itemId}`);
    revalidatePath("/admin");
    revalidatePath("/leaderboard");

    return { message: "Bid placed successfully!", status: "success" };
  } catch (error) {
    console.error("[SERVER_ACTION_ERROR] placeBid:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { message: `An unexpected error occurred: ${errorMessage}`, status: "error" };
  }
}

const itemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startingBid: z.number().min(0, 'Starting bid must be non-negative'),
    minIncrement: z.number().positive('Minimum increment must be a positive number'),
    imageUrl: z.string().url('A valid image URL is required'),
    token: z.string().nullable(),
});


export async function createItem(prevState: any, formData: FormData) {
    try {
        const adminDb = getAdminDb();
        const rawFormData = {
            name: formData.get('name'),
            description: formData.get('description'),
            startingBid: Number(formData.get('startingBid')),
            minIncrement: Number(formData.get('minIncrement')),
            imageUrl: formData.get('imageUrl'),
            token: formData.get('token'),
        }

        const parsed = itemSchema.safeParse(rawFormData);
        if (!parsed.success) {
            return { message: 'Invalid data', errors: parsed.error.flatten().fieldErrors };
        }

        const { name, description, startingBid, minIncrement, imageUrl, token } = parsed.data;
        await verifyAuth(token);

        const itemsCollectionRef = adminDb.collection("items");
        
        await itemsCollectionRef.add({
            name,
            description,
            startingBid,
            minIncrement,
            imageUrl,
            currentBid: startingBid,
            highestBidderName: null,
            highestBidderEmail: null,
            createdAt: FieldValue.serverTimestamp(),
            active: true,
        });

        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath('/leaderboard');
        return { message: 'Item created successfully!', status: 'success' };
    } catch (e) {
        console.error("[SERVER_ACTION_ERROR] createItem:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        return { message: `Failed to create item: ${errorMessage}`, status: 'error' };
    }
}


export async function toggleItemStatus(id: string, active: boolean, token: string | null) {
    try {
        const adminDb = getAdminDb();
        await verifyAuth(token);
        const itemRef = adminDb.doc(`items/${id}`);
        await itemRef.update({ active: active });
        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath('/leaderboard');
        return { message: `Item status updated.`, status: 'success' };
    } catch (error) {
        console.error('[SERVER_ACTION_ERROR] toggleItemStatus:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update item status.";
        return { message: `Failed to update item status: ${errorMessage}`, status: 'error' };
    }
}

export async function toggleGalaStatus(active: boolean, token: string | null) {
    try {
        const adminDb = getAdminDb();
        await verifyAuth(token);
        const itemsCollection = adminDb.collection('items');
        const querySnapshot = await itemsCollection.get();
        const batch = adminDb.batch();

        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { active });
        });

        await batch.commit();

        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath('/leaderboard');

        const status = active ? 'started' : 'stopped';
        return { message: `Gala has been ${status}. All items are now ${active ? 'active' : 'inactive'}.`, status: 'success' };
    } catch(error) {
        console.error('[SERVER_ACTION_ERROR] toggleGalaStatus:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update gala status.";
        return { message: `Failed to update gala status: ${errorMessage}`, status: 'error' };
    }
}

export async function exportWinners(token: string | null) {
    try {
        const adminDb = getAdminDb();
        await verifyAuth(token);
        const itemsSnapshot = await adminDb.collection('items')
            .where('highestBidderEmail', '!=', null)
            .get();

        if (itemsSnapshot.empty) {
            return { message: 'No winners found to export.', status: 'info', csv: '' };
        }

        const winners = itemsSnapshot.docs.map(doc => doc.data() as AuctionItem);

        let csv = 'ItemName,WinnerName,WinnerEmail,WinningBid\n';
        winners.forEach(item => {
            const itemName = `"${item.name.replace(/"/g, '""')}"`;
            const winnerName = `"${item.highestBidderName?.replace(/"/g, '""')}"`;
            csv += `${itemName},${winnerName},${item.highestBidderEmail},${item.currentBid}\n`;
        });
        
        return { message: 'Winners exported successfully.', status: 'success', csv };

    } catch (error) {
        console.error('[SERVER_ACTION_ERROR] exportWinners:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to export winners.";
        return { message: `Failed to export winners: ${errorMessage}`, status: 'error', csv: '' };
    }
}
