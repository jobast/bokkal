import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-background min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
