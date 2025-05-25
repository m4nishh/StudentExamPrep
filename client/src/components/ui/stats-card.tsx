import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon, 
  iconColor 
}: StatsCardProps) {
  const changeColorMap = {
    positive: "text-emerald-600",
    negative: "text-red-600",
    neutral: "text-slate-600"
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-primary mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-2 ${changeColorMap[changeType]}`}>
                <span>{change}</span>
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
