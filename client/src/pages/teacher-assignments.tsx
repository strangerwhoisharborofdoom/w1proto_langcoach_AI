import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Calendar, Trash2 } from "lucide-react";
import type { Assignment, InsertAssignment } from "@shared/schema";

export default function TeacherAssignments() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertAssignment>>({
    title: "",
    description: "",
    testType: "IELTS",
    instructions: "",
  });

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAssignment) => {
      return await apiRequest<Assignment>("POST", "/api/assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Assignment created",
        description: "Your assignment has been created successfully.",
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        testType: "IELTS",
        instructions: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/assignments/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData as InsertAssignment);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Assignments</h1>
          <p className="text-muted-foreground">Create and manage student assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-assignment">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment for your students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  data-testid="input-assignment-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="input-assignment-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testType">Test Type</Label>
                <Select
                  value={formData.testType}
                  onValueChange={(value: "OET" | "IELTS" | "Business English") =>
                    setFormData({ ...formData, testType: value })
                  }
                >
                  <SelectTrigger data-testid="select-test-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IELTS">IELTS</SelectItem>
                    <SelectItem value="OET">OET</SelectItem>
                    <SelectItem value="Business English">Business English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  data-testid="input-due-date"
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  data-testid="input-instructions"
                  value={formData.instructions || ""}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="button-submit-assignment"
              >
                {createMutation.isPending ? "Creating..." : "Create Assignment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first assignment to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <Card key={assignment.id} data-testid={`assignment-card-${assignment.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{assignment.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(assignment.id)}
                    data-testid={`button-delete-${assignment.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                      {assignment.testType}
                    </span>
                    {assignment.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {assignment.instructions && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {assignment.instructions}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
