/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Plus, LogOut, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ShoppingList {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userNumber, setUserNumber] = useState<number | null>(null); // Добавлено состояние userNumber

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchLists();
    }
  }, [user, navigate]);

  const fetchLists = async () => {
    try {
      // Сначала заполняем или проверяем номер пользователя
      if (user?.id) {
        // Проверяем, существует ли уже профиль для этого пользователя
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("number")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        // Если профиль существует и поле number уже заполнено, ничего не делаем
        if (existingProfile && existingProfile.number) {
          setUserNumber(existingProfile.number);
        } else {
          // Генерируем случайное число от 4 до 6
          let randomNumber =
            Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000;
          let uniqueNumber = randomNumber;
          // let uniqueNumber = Math.floor(Math.random() * (1000 - 999999 + 1)) + 1000;

          // Проверяем уникальность числа
          while (true) {
            const { data: checkProfile, error: checkError } = await supabase
              .from("profiles")
              .select("number")
              .eq("number", uniqueNumber);

            if (checkError) throw checkError;

            if (!checkProfile || checkProfile.length === 0) break;

            uniqueNumber = Math.floor(Math.random() * 3) + 4;
          }

          // Если профиль не существует или number не заполнен, обновляем или создаем
          if (!existingProfile) {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                number: uniqueNumber,
              });

            if (insertError) throw insertError;
            setUserNumber(uniqueNumber);
          } else {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ number: uniqueNumber })
              .eq("id", user.id);

            if (updateError) throw updateError;
            setUserNumber(uniqueNumber);
          }
        }
      }

      // Затем загружаем списки покупок
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Не вдалося отримати списки покупок або оновити профіль користувача",
        variant: "destructive",
      });
    }
  };

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("shopping_lists").insert([
        {
          title: newListTitle.trim(),
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setNewListTitle("");
      fetchLists();
      toast({
        title: "Success",
        description: "Список покупок успішно створено",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Не вдалося створити список покупок",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    try {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setLists(lists.filter((list) => list.id !== id));
      toast({
        title: "Success",
        description: "Список покупок успішно видалено",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Не вдалося видалити список покупок",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold"><span style={{ color: "#38B2AC" }}>U</span>Lists</h1>

          <Button variant="outline" onClick={signOut} className="button-bounce">
            <LogOut className="h-4 w-4 mr-2" />
            Вийти
          </Button>
        </div>
        {userNumber !== null && (
          <span className="text-sm text-muted-foreground">
            Номер користувача: {userNumber}
          </span>
        )}
        <Card className="p-6 glass-card mb-8">
          <form onSubmit={createList} className="flex gap-4">
            <Input
              placeholder="Нова назва списку..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Створити список
            </Button>
          </form>
        </Card>

        <AnimatePresence>
          {lists.map((list) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card
                className="p-6 glass-card hover-scale cursor-pointer"
                onClick={() => navigate(`/list/${list.id}`)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{list.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => deleteList(e, list.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
