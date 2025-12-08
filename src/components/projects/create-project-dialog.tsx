import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { orpc } from "@/orpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/orpc/router/projects/schema";
import {
  PROJECT_COLORS,
  PROJECT_ICONS,
  getProjectIconConfig,
} from "./project-constants";

// Generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateProjectDialog = ({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateProjectDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const queryClient = useQueryClient();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      color: PROJECT_COLORS[0],
      icon: PROJECT_ICONS[0].id,
    },
  });

  const createMutation = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        toast.success("Project created successfully!");
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.key() });

        if (createMore) {
          form.reset();
        } else {
          setOpen(false);
          form.reset();
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create project");
      },
    })
  );

  const onSubmit = (data: CreateProjectInput) => {
    createMutation.mutate(data);
  };

  // Auto-generate slug when name changes
  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const name = e.target.value;
    onChange(name);
    const currentSlug = form.getValues("slug");
    const currentName = form.getValues("name");
    if (!currentSlug || currentSlug === generateSlug(currentName)) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const selectedColor = form.watch("color");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !controlledOpen && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Create Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Add a new project to organize your tasks and collaborate with your
            team.
          </DialogDescription>
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
                              disabled={createMutation.isPending}
                            >
                              <IconComponent
                                className="size-5"
                                style={{ color: selectedColor }}
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-fit p-2 max-h-96 overflow-y-auto"
                          align="start"
                        >
                          <div className="grid grid-cols-8 gap-1.5">
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
                        onChange={(e) => handleNameChange(e, field.onChange)}
                        disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                      disabled={createMutation.isPending}
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
                          disabled={createMutation.isPending}
                        />
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 mr-auto">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                  disabled={createMutation.isPending}
                />
                <label
                  htmlFor="create-more"
                  className="text-sm font-medium cursor-pointer"
                >
                  Create more
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Spinner />}
                  Create Project
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
