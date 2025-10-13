import { AdminHeader } from "@/components/admin/header";
import { AdminItemsTable } from "@/components/admin/items-table";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="w-32">
            <Logo />
          </Link>
        </nav>
        <div className="ml-auto">
            <AdminHeader />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">Auction Dashboard</h1>
            <p className="text-muted-foreground">Manage auction items and monitor bidding activity.</p>
        </div>
        <AdminItemsTable />
      </main>
    </div>
  );
}
