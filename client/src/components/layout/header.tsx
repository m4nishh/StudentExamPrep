import { useLocation } from "wouter";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Welcome back! Here's what's happening with your platform.",
  },
  "/boards": {
    title: "Board Management",
    description: "Manage educational boards and their configurations",
  },
  "/subjects": {
    title: "Subject Management",
    description: "Manage subjects and their board associations",
  },
  "/materials": {
    title: "Study Materials",
    description: "Manage educational content and study materials",
  },
  "/notes": {
    title: "Notes Management",
    description: "Create and manage study notes with rich text editor",
  },
  "/pyq": {
    title: "Previous Year Questions",
    description: "Manage and organize previous year question papers",
  },
};

export default function Header() {
  const [location] = useLocation();
  const pageInfo = pageTitles[location] || { title: "Dashboard", description: "Admin Dashboard" };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{pageInfo.title}</h1>
          <p className="text-slate-600">{pageInfo.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
