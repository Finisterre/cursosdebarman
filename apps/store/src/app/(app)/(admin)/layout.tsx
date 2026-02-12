import { AdminHeader } from "@/components/layout/admin-header";
import { Container } from "@/components/layout/container";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40">
      <AdminHeader />
      <Container className="py-10">{children}</Container>
    </div>
  );
}

