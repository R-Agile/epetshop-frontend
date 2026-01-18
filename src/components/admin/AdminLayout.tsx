import { ReactNode } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
