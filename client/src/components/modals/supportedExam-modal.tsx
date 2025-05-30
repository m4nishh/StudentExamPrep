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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertExamSchema } from "@shared/schema";
import { z } from "zod";

interface SupportedExam {
  id: number;
  name?: string;
  thumbnail?: string | null;
  status?: "ACTIVE" | "DEACTIVE" | "PENDING";
}

const formSchema = insertExamSchema.extend({
  id: z.number().optional(),
  name: z.string(),
  thumbnail: z.string().optional(),
  status: z.enum(["ACTIVE", "DEACTIVE", "PENDING"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam?: SupportedExam | null;
}

export function ExamModal({ isOpen, onClose, exam }: ExamModalProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      thumbnail: "",
      status: "PENDING",
    },
  });

  const createSupportedExamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const method = exam ? "PUT" : "POST";
      const url = exam
        ? `/api/exams/create-exam-with-category/${exam.id}`
        : "/api/exams/create-exam-with-category";
      
      const apiUrl = url.startsWith('http') ? url : `https://70af-160-191-74-252.ngrok-free.app${url}`;
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examName: data.name || "",
          status: data.status || "PENDING",
          thumbnail: data.thumbnail || ""
        }),
        credentials: "include"
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams/create-exam-with-category"] });
      toast({
        title: "Success",
        description: exam ? "Exam updated successfully" : "Exam created successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: exam ? "Failed to update exam" : "Failed to create exam",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (exam) {
      form.reset({
        name: exam.name || "",
        status: exam.status || "PENDING",
      });
    } else {
      form.reset({
        name: "",
        status: "PENDING",
      });
    }
  }, [exam, form]);

  const onSubmit = (data: FormData) => {
    createSupportedExamMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{exam ? "Edit Exam" : "Add New Exam"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter exam name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter image URL" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DEACTIVE">Deactive</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSupportedExamMutation.isPending}
                className="bg-accent text-white hover:bg-accent/90"
              >
                {createSupportedExamMutation.isPending
                  ? exam
                    ? "Updating..."
                    : "Creating..."
                  : exam
                  ? "Update Exam"
                  : "Create Exam"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
