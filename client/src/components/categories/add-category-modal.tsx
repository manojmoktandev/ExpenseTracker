import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import * as Icons from "lucide-react";

const formSchema = insertCategorySchema;
type FormData = z.infer<typeof formSchema>;

const availableIcons = [
  { name: "utensils", icon: Icons.Utensils, label: "Food & Dining" },
  { name: "car", icon: Icons.Car, label: "Transportation" },
  { name: "shopping-cart", icon: Icons.ShoppingCart, label: "Shopping" },
  { name: "gamepad-2", icon: Icons.Gamepad2, label: "Entertainment" },
  { name: "zap", icon: Icons.Zap, label: "Utilities" },
  { name: "heart-pulse", icon: Icons.HeartPulse, label: "Healthcare" },
  { name: "home", icon: Icons.Home, label: "Housing" },
  { name: "graduation-cap", icon: Icons.GraduationCap, label: "Education" },
  { name: "plane", icon: Icons.Plane, label: "Travel" },
  { name: "dumbbell", icon: Icons.Dumbbell, label: "Fitness" },
  { name: "shirt", icon: Icons.Shirt, label: "Clothing" },
  { name: "gift", icon: Icons.Gift, label: "Gifts" },
  { name: "help-circle", icon: Icons.HelpCircle, label: "Other" },
];

const availableColors = [
  { name: "red", value: "red", class: "bg-red-500" },
  { name: "blue", value: "blue", class: "bg-blue-500" },
  { name: "green", value: "green", class: "bg-green-500" },
  { name: "purple", value: "purple", class: "bg-purple-500" },
  { name: "yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "pink", value: "pink", class: "bg-pink-500" },
  { name: "orange", value: "orange", class: "bg-orange-500" },
  { name: "teal", value: "teal", class: "bg-teal-500" },
  { name: "indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "gray", value: "gray", class: "bg-gray-500" },
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const [selectedIcon, setSelectedIcon] = useState("help-circle");
  const [selectedColor, setSelectedColor] = useState("gray");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: `fas fa-${selectedIcon}`,
      color: selectedColor,
      description: "",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      form.reset();
      setSelectedIcon("help-circle");
      setSelectedColor("gray");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const categoryData = {
      ...data,
      icon: `fas fa-${selectedIcon}`,
      color: selectedColor,
    };
    createCategoryMutation.mutate(categoryData);
  };

  const handleClose = () => {
    form.reset();
    setSelectedIcon("help-circle");
    setSelectedColor("gray");
    onClose();
  };

  const selectedIconData = availableIcons.find(icon => icon.name === selectedIcon);
  const selectedColorData = availableColors.find(color => color.value === selectedColor);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-2 ${selectedColorData?.class}/10`}>
                {selectedIconData && (
                  <selectedIconData.icon className={`h-8 w-8 ${selectedColorData?.class?.replace('bg-', 'text-')}`} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Preview</p>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconOption.icon;
                const isSelected = selectedIcon === iconOption.name;
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => setSelectedIcon(iconOption.name)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Choose Color</Label>
            <div className="grid grid-cols-5 gap-3 mt-2">
              {availableColors.map((colorOption) => {
                const isSelected = selectedColor === colorOption.value;
                return (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setSelectedColor(colorOption.value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${colorOption.class} ${
                      isSelected 
                        ? "border-foreground scale-110" 
                        : "border-border hover:scale-105"
                    }`}
                    title={colorOption.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what expenses belong in this category"
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}