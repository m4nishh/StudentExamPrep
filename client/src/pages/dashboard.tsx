import { useQuery } from "@tanstack/react-query";
import { Users, ClipboardList, FileText, History, Plus, Upload, BarChart, ArrowUp } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents?.toLocaleString() || "0"}
          change="12% from last month"
          changeType="positive"
          icon={Users}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Active Boards"
          value={stats?.totalBoards || "0"}
          change="2 new this month"
          changeType="positive"
          icon={ClipboardList}
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <StatsCard
          title="Study Materials"
          value={stats?.totalMaterials || "0"}
          change="45 added today"
          changeType="positive"
          icon={FileText}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatsCard
          title="PYQ Papers"
          value={stats?.totalPyqPapers || "0"}
          change="8 uploaded today"
          changeType="positive"
          icon={History}
          iconColor="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/boards">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-3">
                  <Plus className="w-4 h-4 text-accent" />
                  <span className="font-medium">Add New Board</span>
                </div>
                <ArrowUp className="w-4 h-4 text-slate-400 rotate-45" />
              </Button>
            </Link>
            <Link href="/subjects">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-3">
                  <Plus className="w-4 h-4 text-accent" />
                  <span className="font-medium">Add Subject</span>
                </div>
                <ArrowUp className="w-4 h-4 text-slate-400 rotate-45" />
              </Button>
            </Link>
            <Link href="/materials">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-3">
                  <Upload className="w-4 h-4 text-accent" />
                  <span className="font-medium">Upload Content</span>
                </div>
                <ArrowUp className="w-4 h-4 text-slate-400 rotate-45" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <BarChart className="w-4 h-4 text-accent" />
                <span className="font-medium">View Reports</span>
              </div>
              <ArrowUp className="w-4 h-4 text-slate-400 rotate-45" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Mathematics notes uploaded for Class 12 CBSE
                  </p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    New student registered for NEET preparation
                  </p>
                  <p className="text-xs text-slate-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    New subject "Physics" added to JEE Main board
                  </p>
                  <p className="text-xs text-slate-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    PYQ paper uploaded for Chemistry 2023
                  </p>
                  <p className="text-xs text-slate-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
