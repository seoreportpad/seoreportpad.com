// This layout overrides the parent admin layout for the login page
// so it renders without the AdminSidebar
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
