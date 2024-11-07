import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex h-screee w-screen">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
