import Sidebar from "@/components/Sidebar";
import SetupBanner from "@/components/SetupBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <SetupBanner />
        <main className="flex-1 overflow-y-auto p-6 pt-16 lg:pt-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
