import { Construction } from "lucide-react";
import { useLocation } from "react-router";

const titles: Record<string, string> = {
  "/admin/designs": "Design Library",
  "/admin/orders": "Order Management",
  "/admin/settings": "General Settings",
  "/admin/permissions": "Permissions",
};

export default function AdminPlaceholder() {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Admin Module";

  return (
    <div className="grid min-h-[560px] place-items-center rounded-2xl border border-dashed border-[#b8d2e8] bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eef8ff] text-[#315fae]">
          <Construction className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
        <p className="mt-2 text-sm text-[#5a7899]">
          The navigation and page shell are ready for backend integration.
        </p>
      </div>
    </div>
  );
}
