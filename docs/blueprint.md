# **App Name**: SilentBid

## Core Features:

- Item Display: Display all auction items in a responsive grid, updating in real-time with bid information.
- Bidding Modal: Allow users to place bids with name, email, and bid amount input, validating against the current bid and increment.
- AI Bid Validation: Integrate Genkit with a Gemini model to validate bids for potential fraud using the validateBid tool. Provides a reason if fraudulent.
- Secure Bid Submission: Use a secure Server Action (placeBid) to update item documents in Firestore with new bid details.
- Admin Authentication: Secure the admin section (/admin) with Firebase Authentication using Email/Password.
- Admin Dashboard: Display auction items in a sortable data table with columns for item details, bid information, and status (Active/Closed). Includes Start Gala, Stop Gala and Export Winners. Admin can mark a single item as inactive or active.
- Item Creation: Allow admins to create new items via a modal with fields for item details and image upload to Firebase Storage. Calls the createItem server action.

## Style Guidelines:

- Primary color: Deep Blue (#22314F) to evoke sophistication and elegance.
- Background color: Light Gray (#F0F4F8), providing a clean and unobtrusive backdrop that allows the auction items to stand out. The background is subtly of the same hue as the primary color.
- Accent color: Gold (#D4A276), used for highlights, buttons, and key information, symbolizing prestige and value. The accent color is analogous to the deep blue primary color, creating a rich and inviting color scheme.
- Headline font: 'Playfair', a modern serif with an elegant, high-end feel; body font: 'PT Sans', a humanist sans-serif that combines a modern look and a little warmth or personality.
- Use Lucide icons to maintain a consistent and modern aesthetic.
- Ensure full responsiveness across devices using Tailwind CSS.
- Implement subtle animations and transitions using shadcn/ui Toaster and Skeleton components.