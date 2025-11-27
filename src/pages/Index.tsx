import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, ClipboardPen, BookOpen, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.png";
import logoSecondary from "@/assets/logo-secondary.png";
import OrdersTab from "@/components/OrdersTab";
import PreparationTab from "@/components/PreparationTab";
import MenuTab from "@/components/MenuTab";
import DashboardTab from "@/components/DashboardTab";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number; // Preço de Custo Médio
  stock: number;
  visible: boolean;
}

export interface Order {
  id: string;
  items: { menuItem: MenuItem; quantity: number }[];
  total: number;
  status: "pending" | "preparing" | "completed";
  createdAt: Date;
  observation?: string;
  isPaid: boolean;
  paymentMethod: "pix" | "money" | "credit" | "debit";
}

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const menuQuery = query(collection(db, "menuItems"), orderBy("name"));
    const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as MenuItem[];
      setMenuItems(items);
    }, (error) => {
      console.error("Erro ao buscar itens do cardápio:", error);
      toast.error("Não foi possível carregar o cardápio.");
    });

    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as Order;
      });
      setOrders(loadedOrders);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Não foi possível carregar os pedidos.");
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  const addOrder = async (newOrder: Omit<Order, "id">): Promise<boolean> => {
    try {
      const batch = writeBatch(db);
      const ordersCollectionRef = collection(db, "orders");
      const newOrderRef = doc(ordersCollectionRef); 
      batch.set(newOrderRef, {
        ...newOrder,
        createdAt: Timestamp.fromDate(newOrder.createdAt),
      });

      for (const item of newOrder.items) {
        const menuItemRef = doc(db, "menuItems", item.menuItem.id);
        const newStock = item.menuItem.stock - item.quantity;
        // Nota: Venda não altera o preço de custo, apenas baixa o estoque
        batch.update(menuItemRef, { stock: newStock });
      }
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar pedido:", error);
      toast.error("Falha ao criar o pedido.");
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Falha ao atualizar status.");
    }
  };

  const updateOrderPayment = async (orderId: string, isPaid: boolean, paymentMethod?: Order["paymentMethod"]) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const updateData: any = { isPaid };
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast.error("Falha ao atualizar pagamento.");
    }
  };

  const updateMenuItem = async (updatedItem: MenuItem) => {
    try {
      const { id, ...itemData } = updatedItem;
      const menuItemRef = doc(db, "menuItems", id);
      await updateDoc(menuItemRef, itemData);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Falha ao atualizar item.");
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const menuItemRef = doc(db, "menuItems", itemId);
      await deleteDoc(menuItemRef);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      toast.error("Falha ao deletar item.");
    }
  };

  const addMenuItem = async (newItem: Omit<MenuItem, "id">) => {
    try {
      const menuCollectionRef = collection(db, "menuItems");
      await addDoc(menuCollectionRef, newItem);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Falha ao adicionar item.");
    }
  };

  // --- NOVA FUNÇÃO: ENTRADA DE ESTOQUE INTELIGENTE ---
  const handleStockEntry = async (itemId: string, quantityAdded: number, newBatchCost: number) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;

      // 1. Cálculo do Custo Médio Ponderado
      const currentTotalValue = item.stock * (item.costPrice || 0);
      const newBatchValue = quantityAdded * newBatchCost;
      const newTotalStock = item.stock + quantityAdded;
      
      // Evita divisão por zero se o estoque for zero
      const newAverageCost = newTotalStock > 0 
        ? (currentTotalValue + newBatchValue) / newTotalStock 
        : newBatchCost;

      const batch = writeBatch(db);

      // 2. Atualiza o Item (Estoque + Novo Custo)
      const itemRef = doc(db, "menuItems", itemId);
      batch.update(itemRef, {
        stock: newTotalStock,
        costPrice: newAverageCost
      });

      // 3. Cria o Registro Histórico (Log)
      const logsRef = doc(collection(db, "stock_logs"));
      batch.set(logsRef, {
        itemId: itemId,
        itemName: item.name,
        type: "entry", // 'entry' = entrada
        quantity: quantityAdded,
        costPrice: newBatchCost, // Quanto custou ESSA remessa
        newAverageCost: newAverageCost, // Como ficou o custo médio depois
        createdAt: Timestamp.now()
      });

      await batch.commit();
      toast.success("Estoque atualizado e registrado com sucesso!");

    } catch (error) {
      console.error("Erro na entrada de estoque:", error);
      toast.error("Falha ao registrar entrada.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary bg-card shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="SH82 Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-4xl font-black text-primary tracking-tight">Lanchonete SH82</h1>
                <p className="text-sm text-muted-foreground font-medium">Sistema de Pedidos</p>
              </div>
            </div>
            <img src={logoSecondary} alt="Logo Secundária" className="h-16 w-auto" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="orders" className="gap-2">
                <ClipboardPen className="h-4 w-4" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="preparation" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Preparação
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Estoque & Cardápio
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders">
            <OrdersTab menuItems={menuItems} onAddOrder={addOrder} />
          </TabsContent>

          <TabsContent value="preparation">
            <PreparationTab orders={orders} onUpdateStatus={updateOrderStatus} onUpdatePayment={updateOrderPayment} />
          </TabsContent>

          <TabsContent value="menu">
            <MenuTab
              menuItems={menuItems}
              onUpdateItem={updateMenuItem}
              onDeleteItem={deleteMenuItem}
              onAddItem={addMenuItem}
              onStockEntry={handleStockEntry} // Passamos a nova função
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardTab orders={orders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;