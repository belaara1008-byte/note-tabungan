import { Link } from "@tanstack/react-router";
import { Home, Star, BarChart3, User } from "lucide-react";

const items = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/impian", label: "Impian", icon: Star },
  { to: "/mutasi", label: "Mutasi", icon: BarChart3 },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3">
      <div className="glass-card flex items-center justify-around rounded-3xl px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-gold"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
