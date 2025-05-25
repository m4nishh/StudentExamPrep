import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Download, Edit, Trash2, Search, Eye, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PyqModal } from "@/components/modals/pyq-modal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PyqPaper, Board, Subject } from "@shared/schema";

export default function PYQ() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const { toast } = useToast();

  const { data: pyqPapers, isLoading } = useQuery({
    queryKey: ["/api/pyq-papers"],
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/boards"],
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const deletePyqMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/pyq-papers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pyq-papers"] });
      toast({
        title: "Success",
        description: "PYQ paper deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete PYQ paper",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getYearGradient = (year: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-red-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-purple-500 to-indigo-600",
    ];
    return gradients[year % gradients.length];
  };

  const filteredPapers = pyqPapers?.filter((paper: PyqPaper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBoard = !selectedBoard || paper.boardId.toString() === selectedBoard;
    const matchesSubject = !selectedSubject || paper.subjectId.toString() === selectedSubject;
    const matchesYear = !selectedYear || paper.year.toString() === selectedYear;
    return matchesSearch && matchesBoard && matchesSubject && matchesYear;
  }) || [];

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this PYQ paper?")) {
      deletePyqMutation.mutate(id);
    }
  };

  const availableYears = Array.from(new Set(pyqPapers?.map((p: PyqPaper) => p.year) || []))
    .sort((a, b) => b - a);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
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
          <h2 className="text-2xl font-bold text-primary">Previous Year Questions</h2>
          <p className="text-slate-600">Manage and organize previous year question papers</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white hover:bg-accent/90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload PYQ Paper
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PYQ Papers List */}
      {filteredPapers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No PYQ papers found</h3>
            <p className="text-slate-600 mb-4">Upload your first previous year question paper to get started.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload PYQ Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper: PyqPaper) => (
            <Card key={paper.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getYearGradient(paper.year)} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                      {paper.year.toString().slice(-2)}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-primary">{paper.title}</h4>
                      <div className="flex items-center space-x-6 text-sm text-slate-600 mt-2">
                        <span>{getBoardName(paper.boardId)}</span>
                        <span>{getSubjectName(paper.subjectId)}</span>
                        <span>{paper.year}</span>
                        {paper.duration && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {Math.floor(paper.duration / 60)}h {paper.duration % 60}m
                          </span>
                        )}
                        {paper.totalQuestions && (
                          <span className="flex items-center">
                            <HelpCircle className="w-4 h-4 mr-1" />
                            {paper.totalQuestions} Questions
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge className={paper.hasSolutions ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                          {paper.hasSolutions ? "Solved" : "Unsolved"}
                        </Badge>
                        <Badge className={paper.hasAnswerKey ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"}>
                          {paper.hasAnswerKey ? "Answer Key Available" : "No Answer Key"}
                        </Badge>
                        <span className="text-xs text-slate-500">{formatFileSize(paper.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(paper.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PyqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boards={boards || []}
        subjects={subjects || []}
      />
    </div>
  );
}
