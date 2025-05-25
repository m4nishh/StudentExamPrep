import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertNoteSchema, type Note, type Board, type Subject } from "@shared/schema";
import { z } from "zod";

const formSchema = insertNoteSchema.extend({
  id: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  boards: Board[];
  subjects: Subject[];
}

export function NoteModal({ isOpen, onClose, note, boards, subjects }: NoteModalProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      boardId: 0,
      subjectId: 0,
      createdBy: 1, // Default admin user
    },
  });

  const selectedBoardId = form.watch("boardId");
  const filteredSubjects = subjects.filter(subject => 
    selectedBoardId === 0 || subject.boardId === selectedBoardId
  );

  const createNoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (note) {
        return await apiRequest("PUT", `/api/notes/${note.id}`, data);
      } else {
        return await apiRequest("POST", "/api/notes", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: note ? "Note updated successfully" : "Note created successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: note ? "Failed to update note" : "Failed to create note",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        boardId: note.boardId,
        subjectId: note.subjectId,
        createdBy: note.createdBy,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        boardId: 0,
        subjectId: 0,
        createdBy: 1,
      });
    }
  }, [note, form]);

  const onSubmit = (data: FormData) => {
    createNoteMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
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
                    <Input placeholder="Enter note title" {...field} />
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
                          <SelectValue placeholder="Select a board" />
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
                          <SelectValue placeholder="Select a subject" />
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter note content..."
                      rows={12}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-muted-foreground">
                    You can use basic formatting like line breaks and paragraphs
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createNoteMutation.isPending}
                className="bg-accent text-white hover:bg-accent/90"
              >
                {createNoteMutation.isPending 
                  ? (note ? "Updating..." : "Creating...") 
                  : (note ? "Update Note" : "Create Note")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
