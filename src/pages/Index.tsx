import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, ClipboardPen, BookOpen } from "lucide-react";
import logo from "@/assets/logo.png";
import logoSecondary from "@/assets/logo-secondary.png";
import OrdersTab from "@/components/OrdersTab";
import PreparationTab from "@/components/PreparationTab";
import MenuTab from "@/components/MenuTab";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
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
}

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "X-Burger Clássico",
      description: "Hambúrguer, queijo, alface, tomate e molho especial",
      price: 18.5,
      stock: 50,
      visible: true,
    },
    {
      id: "2",
      name: "X-Bacon",
      description: "Hambúrguer, bacon, queijo, alface e tomate",
      price: 22.0,
      stock: 40,
      visible: true,
    },
    {
      id: "3",
      name: "Hot Dog Completo",
      description: "Salsicha, purê, batata palha, milho, ervilha e molhos",
      price: 12.0,
      stock: 60,
      visible: true,
    },
    {
      id: "4",
      name: "Refrigerante Lata",
      description: "Coca-Cola, Guaraná ou Fanta",
      price: 5.0,
      stock: 100,
      visible: true,
    },
    {
      id: "5",
      name: "Batata Frita",
      description: "Porção grande com molho",
      price: 15.0,
      stock: 35,
      visible: true,
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (newOrder: Order) => {
    // Update stock for all items in the order at once
    setMenuItems(menuItems.map((menuItem) => {
      const orderItem = newOrder.items.find(item => item.menuItem.id === menuItem.id);
      if (orderItem) {
        return { ...menuItem, stock: menuItem.stock - orderItem.quantity };
      }
      return menuItem;
    }));
    
    setOrders([...orders, newOrder]);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const updateOrderPayment = (orderId: string, isPaid: boolean) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, isPaid } : order)));
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(menuItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
  };

  const addMenuItem = (newItem: Omit<MenuItem, "id">) => {
    const item: MenuItem = {
      ...newItem,
      id: Date.now().toString(),
      visible: true,
    };
    setMenuItems([...menuItems, item]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <div className="flex justify-center mb-8">
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
                Cardápio
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
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
