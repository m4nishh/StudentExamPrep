import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectModal } from "@/components/modals/subject-modal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject, Board } from "@shared/schema";

export default function Subjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/board-exam/subjects"],
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/board-exam/subjects"],
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/board-exam/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/board-exam/subjects"] });
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    },
  });

  const getBoardName = (boardId: number) => {
    const board = boards?.find((b: Board) => b.id === boardId);
    return board?.name || "Unknown Board";
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteSubjectMutation.mutate(id);
    }
  };

  const getSubjectIcon = (name: string) => {
    const icons: Record<string, string> = {
      mathematics: "√",
      physics: "⚛",
      chemistry: "⚗",
      biology: "🧬",
      english: "📝",
      history: "📚",
    };
    return icons[name.toLowerCase()] || "📖";
  };

  if (subjectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
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
          <h2 className="text-2xl font-bold text-primary">Subject Management</h2>
          <p className="text-slate-600">Manage subjects and their board associations</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
          className="bg-accent text-white hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Subject
        </Button>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject: Subject) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  {getSubjectIcon(subject.name)}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subject)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{subject.name}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {subject.description || "No description available"}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Board:</span>
                  <span className="font-medium">{getBoardName(subject.boardId)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Materials:</span>
                  <span className="font-medium">0 files</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">PYQ Papers:</span>
                  <span className="font-medium">0 papers</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Badge className={subject.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        subject={editingSubject}
        boards={boards || []}
      />
    </div>
  );
}
