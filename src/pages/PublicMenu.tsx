import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { MenuItem } from "./Index"; // Reaproveitando a interface do Index

const PublicMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca apenas itens marcados como "visíveis" (olho aberto)
    const q = query(
      collection(db, "menuItems"),
      where("visible", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as MenuItem[];
      
      // Ordena alfabeticamente pelo nome para ficar organizado
      items.sort((a, b) => a.name.localeCompare(b.name));
      
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar cardápio:", error);
      toast.error("Erro ao carregar o cardápio.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabeçalho da Vitrine */}
      <header className="bg-card shadow-sm sticky top-0 z-10 border-b-4 border-primary">
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <img src={logo} alt="Lanchonete SH82" className="h-16 w-auto" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black text-primary tracking-tight">Nosso Cardápio</h1>
          <p className="text-muted-foreground text-lg">Confira nossas delícias disponíveis para você.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando delícias...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
            <p className="text-xl text-muted-foreground font-medium">Nenhum item disponível no momento.</p>
            <p className="text-sm text-muted-foreground mt-2">Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group h-full flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex justify-between items-start gap-4 h-full">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-3">
                        {item.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1 whitespace-nowrap shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
                      R$ {item.price.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <footer className="text-center text-sm text-muted-foreground py-8 border-t bg-muted/20 mt-auto">
        <p>© Lanchonete SH82 - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default PublicMenu;