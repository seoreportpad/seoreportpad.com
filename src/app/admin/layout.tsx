import AdminSidebar from "@/components/AdminSidebar";

export const metadata = { title: "Admin — SEO Report Manager" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
