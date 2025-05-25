import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Download, Edit, Trash2, Search, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialModal } from "@/components/modals/material-modal";
import { FileUpload } from "@/components/ui/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Material, Board, Subject } from "@shared/schema";

export default function Materials() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const { toast } = useToast();

  const { data: materials, isLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/boards"],
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    },
  });

  const getBoardName = (boardId: number) => {
    const board = boards?.find((b: Board) => b.id === boardId);
    return board?.name || "Unknown Board";
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects?.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  const filteredMaterials = materials?.filter((material: Material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBoard = selectedBoard === "all" || !selectedBoard || material.boardId.toString() === selectedBoard;
    const matchesSubject = selectedSubject === "all" || !selectedSubject || material.subjectId.toString() === selectedSubject;
    return matchesSearch && matchesBoard && matchesSubject;
  }) || [];

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      deleteMaterialMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
        <div className="space-y-4">
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
          <h2 className="text-2xl font-bold text-primary">Study Materials</h2>
          <p className="text-slate-600">Manage educational content and study materials</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white hover:bg-accent/90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Materials
        </Button>
      </div>

      {/* Quick Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFilesSelected={(files) => {
              toast({
                title: "Files Selected",
                description: `${files.length} file(s) ready to upload`,
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards?.map((board: Board) => (
                    <SelectItem key={board.id} value={board.id.toString()}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Materials List */}
          <div className="divide-y divide-slate-200">
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No materials found</h3>
                <p className="text-slate-600">Upload your first study material to get started.</p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Material
                </Button>
              </div>
            ) : (
              filteredMaterials.map((material: Material) => (
                <div key={material.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                        {getFileIcon(material.fileType)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-slate-900">{material.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <span>
                            <File className="w-4 h-4 inline mr-1" />
                            {getBoardName(material.boardId)}
                          </span>
                          <span>
                            <FileText className="w-4 h-4 inline mr-1" />
                            {getSubjectName(material.subjectId)}
                          </span>
                          <span>{formatFileSize(material.fileSize)}</span>
                          <span>Uploaded {formatDate(material.createdAt)}</span>
                        </div>
                        {material.description && (
                          <p className="text-sm text-slate-600 mt-2">{material.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boards={boards || []}
        subjects={subjects || []}
      />
    </div>
  );
}
