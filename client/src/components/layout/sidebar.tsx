import { Link, useLocation } from "wouter";
import { 
  GraduationCap, 
  LayoutDashboard, 
  ClipboardList, 
  Book, 
  FileText, 
  StickyNote, 
  History, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Boards",
    href: "/boards",
    icon: ClipboardList,
  },
  {
    title: "Subjects",
    href: "/subjects",
    icon: Book,
  },
];

const contentNavItems = [
  {
    title: "Study Materials",
    href: "/materials",
    icon: FileText,
  },
  {
    title: "Notes",
    href: "/notes",
    icon: StickyNote,
  },
  {
    title: "Previous Year Questions",
    href: "/pyq",
    icon: History,
  },
];

const systemNavItems = [
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function NavSection({ title, items }: { title: string; items: typeof mainNavItems }) {
  const [location] = useLocation();

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
        {title}
      </h3>
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-accent/10 text-accent font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">EduBoard</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-6">
        <NavSection title="Main" items={mainNavItems} />
        <NavSection title="Content" items={contentNavItems} />
        <NavSection title="System" items={systemNavItems} />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@eduboard.com</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
