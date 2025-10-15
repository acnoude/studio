
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  LogOut,
  PlusCircle,
  Play,
  Square,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateItemModal } from "@/components/admin/create-item-modal";
import { useToast } from "@/hooks/use-toast";
import { toggleGalaStatus, exportWinners } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleToggleGala = async (active: boolean) => {
    setIsToggling(true);
    const result = await toggleGalaStatus(active);
    if (result.status === "success") {
      toast({ title: "Success", description: result.message });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsToggling(false);
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    const result = await exportWinners();
    if (result.status === 'success' && result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'winners.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Success', description: 'Winners CSV has been downloaded.' });
    } else if (result.status === 'info') {
        toast({ title: 'No Winners Yet', description: 'There are no items with winning bids to export.' });
    } else {
        toast({ title: 'Export Failed', description: result.message, variant: 'destructive' });
    }
    setIsExporting(false);
  }

  const getInitials = (email: string) => {
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <>
            <Button size="sm" onClick={() => handleToggleGala(true)} disabled={isToggling}>
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start Gala
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleToggleGala(false)}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Square className="mr-2 h-4 w-4" /> Stop Gala
                </>
              )}
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Item
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? ""} alt="Admin" />
                    <AvatarFallback>{user?.email ? getInitials(user.email) : 'A'}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isMobile && (
              <>
                <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create Item</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleGala(true)} disabled={isToggling}>
                  {isToggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  <span>Start Gala</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleGala(false)} disabled={isToggling}>
                  {isToggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4 text-destructive" />}
                  <span className="text-destructive">Stop Gala</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Export Winners
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CreateItemModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
