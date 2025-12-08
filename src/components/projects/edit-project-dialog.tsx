import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/orpc/router/projects/schema";
import {
  PROJECT_COLORS,
  PROJECT_ICONS,
  getProjectIconConfig,
} from "./project-constants";
import type { Project } from "@/orpc/router/projects";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectDialog = ({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) => {
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      slug: "",
      color: PROJECT_COLORS[0],
      icon: PROJECT_ICONS[0].id,
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        id: project.id,
        name: project.name,
        description: project.description || "",
        slug: project.slug,
        color: project.color || PROJECT_COLORS[0],
        icon: project.icon || PROJECT_ICONS[0].id,
      });
    }
  }, [project, form]);

  const updateMutation = useMutation(
    orpc.projects.update.mutationOptions({
      onSuccess: () => {
        toast.success("Project updated successfully!");
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.key() });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update project");
      },
    })
  );

  const onSubmit = (data: UpdateProjectInput) => {
    updateMutation.mutate(data);
  };

  const selectedColor = form.watch("color") || PROJECT_COLORS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the project details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Icon and Name in same row */}
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => {
                  const selectedIcon = getProjectIconConfig(field.value);
                  const IconComponent = selectedIcon.icon;

                  return (
                    <FormItem>
                      <Popover
                        open={iconPopoverOpen}
                        onOpenChange={setIconPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-10 shrink-0"
                              style={{
                                backgroundColor: `${selectedColor}15`,
                                borderColor: `${selectedColor}40`,
                              }}
                              disabled={updateMutation.isPending}
                            >
                              <IconComponent
                                className="size-5"
                                style={{ color: selectedColor }}
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-fit max-h-96 overflow-y-auto p-2"
                          align="start"
                        >
                          <div className="grid grid-cols-8 gap-1.5 pr-2">
                            {PROJECT_ICONS.map(({ id, icon: Icon, label }) => (
                              <button
                                key={id}
                                type="button"
                                title={label}
                                className={cn(
                                  "flex size-10 items-center justify-center rounded-md border transition-all hover:bg-accent",
                                  field.value === id &&
                                    "border-primary bg-primary/10 text-primary"
                                )}
                                onClick={() => {
                                  field.onChange(id);
                                  setIconPopoverOpen(false);
                                }}
                              >
                                <Icon className="size-5" />
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Project name"
                        className="h-10"
                        {...field}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-awesome-project"
                      {...field}
                      disabled={updateMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier for the project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this project is about..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      disabled={updateMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="size-7 rounded-full ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          style={{
                            backgroundColor: color,
                            boxShadow:
                              field.value === color
                                ? `0 0 0 2px white, 0 0 0 4px ${color}`
                                : undefined,
                          }}
                          onClick={() => field.onChange(color)}
                          disabled={updateMutation.isPending}
                        />
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Spinner />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
