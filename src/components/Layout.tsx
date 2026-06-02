import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Brain, GraduationCap, LayoutDashboard, Layers, PlusCircle, NotebookPen, LogOut, User, Trophy, FileText, ClipboardList, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAiAccess } from "@/hooks/useAiAccess";
import AiAccessDialog from "@/components/AiAccessDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/units", label: "Units", icon: BookOpen },
  { to: "/notebook", label: "Notebook", icon: NotebookPen },
  { to: "/prove", label: "Prove It", icon: Trophy },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/quiz", label: "Quiz", icon: Brain },
  { to: "/exam-technique", label: "Exam Skills", icon: GraduationCap },
  { to: "/planning", label: "Planning", icon: ClipboardList },
  { to: "/mock-exam", label: "Mock Exam", icon: FileText },
  { to: "/add-unit", label: "Add Unit", icon: PlusCircle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { mode } = useAiAccess();
  const [aiOpen, setAiOpen] = useState(false);
  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .slice(0, 1)
    .toUpperCase();

  const visibleNav = navItems.filter((n) => !(n.to === "/prove" && mode === "free"));


  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-navy sticky top-0 z-50 border-b border-sidebar-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">📖</span>
            <span className="font-display text-xl font-bold text-primary-foreground">
              Socio<span className="text-gradient">Study</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-sidebar-accent text-accent"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-full bg-accent text-accent-foreground font-semibold text-sm shrink-0">
                {initials}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <div className="truncate max-w-[180px]">{user.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/auth", { replace: true });
                  }}
                  className="gap-2"
                >
                  <LogOut size={14} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
