import type { ReactNode } from "react";

import { AcademyAdminNav } from "@/components/admin/AcademyAdminNav";

export default function AdminAcademyLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AcademyAdminNav />
      {children}
    </div>
  );
}
