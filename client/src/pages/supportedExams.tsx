import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Eye, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamModal } from "@/components/modals/supportedExam-modal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SupportedExam } from "@shared/schema";

export default function SupportedExams() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<SupportedExam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/exams/all-supported-type"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/exams/all-supported-type");
      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    }
  });
  
  const SupportedExam = data || [];

  const deleteExamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Supported exam deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete supported exam",
        variant: "destructive",
      });
    },
  });

  const filteredExams = searchTerm
    ? SupportedExam?.filter((exam: SupportedExam) =>
        exam.examName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : SupportedExam;

  const handleEdit = (exam: SupportedExam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this supported exam?")) {
      deleteExamMutation.mutate(id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "secondary":
        return "bg-blue-100 text-blue-800";
      case "competitive":
        return "bg-purple-100 text-purple-800";
      case "professional":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Supported Exams Management</h2>
          <p className="text-slate-600">Manage supported examinations and their categories</p>
        </div>
        <Button 
          onClick={() => {
            setEditingExam(null);
            setIsModalOpen(true);
          }}
          className="bg-accent text-white hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Exam
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search supported exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boards Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredExams.map((exam: SupportedExam) => (
                  <tr key={exam.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {exam.examName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{exam.examName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.thumbnail ? (
                        <img
                          src={exam.thumbnail}
                          alt={exam.examName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs ${getTypeColor(exam.status)}`}>
                        {exam.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(exam)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exam.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
         // setEditingBoard(null);
        }}
        //board={editingBoard}
      />
    </div>
  );
}
