import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteModal } from "@/components/modals/note-modal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Note, Board, Subject } from "@shared/schema";

export default function Notes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["/api/notes"],
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/boards"],
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const getSubjectName = (subjectId: number) => {
    const subject = subjects?.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getSubjectColor = (subjectId: number) => {
    const subject = subjects?.find((s: Subject) => s.id === subjectId);
    const colors: Record<string, string> = {
      mathematics: "bg-blue-100 text-blue-800",
      physics: "bg-emerald-100 text-emerald-800",
      chemistry: "bg-purple-100 text-purple-800",
      biology: "bg-red-100 text-red-800",
      english: "bg-yellow-100 text-yellow-800",
    };
    return colors[subject?.name.toLowerCase() || ""] || "bg-slate-100 text-slate-800";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  const filteredNotes = notes?.filter((note: Note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-primary">Notes Management</h2>
          <p className="text-slate-600">Create and manage study notes with rich text editor</p>
        </div>
        <Button 
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
          className="bg-accent text-white hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No notes found</h3>
            <p className="text-slate-600 mb-4">Create your first study note to get started.</p>
            <Button 
              onClick={() => {
                setEditingNote(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note: Note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getSubjectColor(note.subjectId)}>
                    {getSubjectName(note.subjectId)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{note.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created {formatDate(note.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {note.views || 0} views
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        note={editingNote}
        boards={boards || []}
        subjects={subjects || []}
      />
    </div>
  );
}
