import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4"><span style={{ color: "#38B2AC" }}>U</span>List</h1>
          <p className="text-lg text-muted-foreground">
            Створюйте списки покупок разом із друзями та родиною
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-semibold mb-4">Розпочати</h2>
              <p className="text-muted-foreground mb-6">
                Легко створюйте списки покупок і діліться ними. Увійдіть, щоб
                почати організація вашого шопінгу.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full button-bounce"
              >
                Розпочати
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 glass-card">
              <h2 className="text-2xl font-semibold mb-4">Особливості</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-primary" />
                  Створіть кілька списків покупок
                </li>
                <li className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-primary" />
                  Запросіть друзів і рідних
                </li>
                <li className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-primary" />
                  Оновлення в реальному часі
                </li>
                <li className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-primary" />
                  Розумна організація
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
