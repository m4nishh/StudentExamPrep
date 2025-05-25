import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPyqPaperSchema, type Board, type Subject } from "@shared/schema";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().min(1990, "Year must be valid").max(new Date().getFullYear(), "Year cannot be in the future"),
  boardId: z.number().min(1, "Board is required"),
  subjectId: z.number().min(1, "Subject is required"),
  duration: z.number().optional(),
  totalQuestions: z.number().optional(),
  hasSolutions: z.boolean().default(false),
  hasAnswerKey: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface PyqModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  subjects: Subject[];
}

export function PyqModal({ isOpen, onClose, boards, subjects }: PyqModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: new Date().getFullYear(),
      boardId: 0,
      subjectId: 0,
      duration: undefined,
      totalQuestions: undefined,
      hasSolutions: false,
      hasAnswerKey: false,
    },
  });

  const selectedBoardId = form.watch("boardId");
  const filteredSubjects = subjects.filter(subject => 
    selectedBoardId === 0 || subject.boardId === selectedBoardId
  );

  const uploadPyqMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (selectedFiles.length === 0) {
        throw new Error("Please select a file to upload");
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("year", data.year.toString());
      formData.append("boardId", data.boardId.toString());
      formData.append("subjectId", data.subjectId.toString());
      if (data.duration) formData.append("duration", data.duration.toString());
      if (data.totalQuestions) formData.append("totalQuestions", data.totalQuestions.toString());
      formData.append("hasSolutions", data.hasSolutions.toString());
      formData.append("hasAnswerKey", data.hasAnswerKey.toString());
      formData.append("file", selectedFiles[0]);

      const response = await fetch("/api/pyq-papers", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload PYQ paper");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pyq-papers"] });
      toast({
        title: "Success",
        description: "PYQ paper uploaded successfully",
      });
      onClose();
      form.reset();
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload PYQ paper",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    uploadPyqMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedFiles([]);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload PYQ Paper</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., JEE Main 2023 - Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="boardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      form.setValue("subjectId", 0); // Reset subject when board changes
                    }} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board.id} value={board.id.toString()}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="180"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Questions</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasSolutions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Has Solutions</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        This paper includes detailed solutions
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasAnswerKey"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Has Answer Key</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        This paper includes an answer key
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div>
              <label className="text-sm font-medium">File Upload</label>
              <div className="mt-2">
                <FileUpload onFilesSelected={setSelectedFiles} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploadPyqMutation.isPending || selectedFiles.length === 0}
                className="bg-accent text-white hover:bg-accent/90"
              >
                {uploadPyqMutation.isPending ? "Uploading..." : "Upload PYQ Paper"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
