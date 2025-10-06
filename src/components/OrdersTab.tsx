import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";
import type { MenuItem, Order } from "@/pages/Index";

interface OrdersTabProps {
  menuItems: MenuItem[];
  onAddOrder: (order: Order) => void;
}

const OrdersTab = ({ menuItems, onAddOrder }: OrdersTabProps) => {
  const [orderItems, setOrderItems] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);
  const [observation, setObservation] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const { playNewOrderSound } = useSound();

  const addItemToOrder = (menuItem: MenuItem) => {
    const existing = orderItems.find((item) => item.menuItem.id === menuItem.id);
    if (existing) {
      if (existing.quantity < menuItem.stock) {
        setOrderItems(
          orderItems.map((item) =>
            item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        toast.error("Estoque insuficiente!");
      }
    } else {
      if (menuItem.stock > 0) {
        setOrderItems([...orderItems, { menuItem, quantity: 1 }]);
      } else {
        toast.error("Produto sem estoque!");
      }
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(
      orderItems
        .map((item) => {
          if (item.menuItem.id === menuItemId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.menuItem.stock) {
              toast.error("Estoque insuficiente!");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      toast.error("Adicione itens ao pedido!");
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      items: orderItems,
      total: calculateTotal(),
      status: "pending",
      createdAt: new Date(),
      observation: observation.trim() || undefined,
      isPaid,
    };

    onAddOrder(newOrder);
    playNewOrderSound();
    setOrderItems([]);
    setObservation("");
    setIsPaid(false);
    toast.success("Pedido criado com sucesso!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Itens Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.filter((item) => item.stock > 0 && item.visible).map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-xl transition-all cursor-pointer border-2"
              onClick={() => addItemToOrder(item)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Estoque: {item.stock}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Order */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4 border-2 border-primary shadow-xl">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedido Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {orderItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item no pedido
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.menuItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.menuItem.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-border pt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Observação</label>
                    <Textarea
                      placeholder="Ex: Sem cebola, sem molho..."
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPaid"
                      checked={isPaid}
                      onCheckedChange={(checked) => setIsPaid(checked as boolean)}
                    />
                    <label
                      htmlFor="isPaid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Pedido já foi pago
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-black text-primary">
                      R$ {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button onClick={handleSubmitOrder} className="w-full" size="lg">
                    Finalizar Pedido
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersTab;
