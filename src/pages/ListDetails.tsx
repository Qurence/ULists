import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Check, Pencil, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ListItem {
  id: string;
  name: string;
  completed: boolean;
  created_at: string;
}

const ListDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<{ title: string; user_id: string } | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [collaboratorNumber, setCollaboratorNumber] = useState("");
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchListDetails();
    }
  }, [user, id, navigate]);

  const fetchListDetails = async () => {
    try {
      // Fetch list details
      const { data: listData, error: listError } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("id", id)
        .single();

      if (listError) throw listError;
      setList(listData);

      // Fetch list items
      const { data: itemsData, error: itemsError } = await supabase
        .from("list_items")
        .select("*")
        .eq("list_id", id)
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch list details",
        variant: "destructive",
      });
    }
  };

  const addCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    // Проверяем, что введенное число входит в нужный диапазон
    const number = parseInt(collaboratorNumber, 10);
    if (isNaN(number) || number < 1000 || number > 999999) {
      toast({
        title: "Error",
        description: "Please enter a valid number between 1000 and 999999",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCollaborator(true);
    try {
      // First, try to find the user with the given number
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("number", number)
        .single();

      if (userError || !userData) {
        toast({
          title: "Error",
          description: "User not found with this number",
          variant: "destructive",
        });
        return;
      }

      // Add the user to list_collaborators
      const { error: collaboratorError } = await supabase
        .from("list_collaborators")
        .insert([
          {
            list_id: id,
            user_id: userData.id,
          },
        ]);

      if (collaboratorError) {
        if (collaboratorError.code === '23505') { // Unique constraint error
          toast({
            title: "Error",
            description: "This user is already a collaborator",
            variant: "destructive",
          });
          return;
        }
        throw collaboratorError;
      }

      toast({
        title: "Success",
        description: "Collaborator added successfully",
      });
      setCollaboratorNumber("");
      setIsCollaboratorDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add collaborator",
        variant: "destructive",
      });
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("list_items").insert([
        {
          list_id: id,
          name: newItemName.trim(),
          completed: false
        },
      ]);

      if (error) throw error;

      setNewItemName("");
      fetchListDetails();
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemComplete = async (itemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("list_items")
        .update({ completed: !completed })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, completed: !completed } : item
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const startEditing = (item: ListItem) => {
    setEditingItem(item.id);
    setEditingName(item.name);
  };

  const saveEdit = async () => {
    if (!editingItem || !editingName.trim()) return;

    try {
      const { error } = await supabase
        .from("list_items")
        .update({ name: editingName.trim() })
        .eq("id", editingItem);

      if (error) throw error;

      setItems(items.map(item =>
        item.id === editingItem ? { ...item, name: editingName.trim() } : item
      ));
      setEditingItem(null);
      setEditingName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("list_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>
          <Button
            onClick={() => setIsCollaboratorDialogOpen(true)}
            variant="outline"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Collaborator
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">{list?.title}</h1>

        <Card className="p-6 glass-card mb-8">
          <form onSubmit={addItem} className="flex gap-4">
            <Input
              placeholder="Add new product..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </form>
        </Card>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card className="p-4 glass-card hover-scale">
                <div className="flex items-center justify-between">
                  {editingItem === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={saveEdit} variant="ghost">
                        Save
                      </Button>
                      <Button onClick={() => setEditingItem(null)} variant="ghost">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleItemComplete(item.id, item.completed)}
                          size="icon"
                          variant="ghost"
                        >
                          <Check className={`h-4 w-4 ${item.completed ? 'text-green-500' : ''}`} />
                        </Button>
                        <Button
                          onClick={() => startEditing(item)}
                          size="icon"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteItem(item.id)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <Dialog open={isCollaboratorDialogOpen} onOpenChange={setIsCollaboratorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Collaborator</DialogTitle>
              <DialogDescription>
                Enter the unique number of the person you want to add to this list.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addCollaborator} className="space-y-4">
              <Input
                placeholder="Enter unique number"
                type="text"
                value={collaboratorNumber}
                onChange={(e) => setCollaboratorNumber(e.target.value)}
                required
                pattern="\d*"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCollaboratorDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingCollaborator}>
                  {isAddingCollaborator ? "Adding..." : "Add Collaborator"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ListDetails;