import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Package, Download, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";
import type { Order } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface PreparationTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onUpdatePayment: (orderId: string, isPaid: boolean) => void;
}

const PreparationTab = ({ orders, onUpdateStatus, onUpdatePayment }: PreparationTabProps) => {
  const { playOrderCompletedSound } = useSound();
  const [showTableView, setShowTableView] = useState(false);
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter((order) => order.status === "preparing");
  const completedOrders = orders.filter((order) => order.status === "completed");

  const exportToCSV = () => {
    const headers = ["Pedido", "Horário", "Itens", "Total", "Status Pagamento"];
    const rows = completedOrders.map(order => [
      `#${order.id.slice(-4)}`,
      order.createdAt.toLocaleString("pt-BR"),
      order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join("; "),
      `R$ ${order.total.toFixed(2)}`,
      order.isPaid ? "Pago" : "Pendente"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos_concluidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dados exportados com sucesso!");
  };

  const handleStartPreparation = (orderId: string) => {
    onUpdateStatus(orderId, "preparing");
    toast.success("Pedido em preparação!");
  };

  const handleCompleteOrder = (orderId: string) => {
    onUpdateStatus(orderId, "completed");
    playOrderCompletedSound();
    toast.success("Pedido concluído!");
  };

  const handleMarkAsPaid = (orderId: string) => {
    onUpdatePayment(orderId, true);
    toast.success("Pedido marcado como pago!");
  };

  const OrderCard = ({ order, showButton, buttonText, buttonAction, icon: Icon, iconColor, showPaymentButton }: {
    order: Order;
    showButton?: boolean;
    buttonText?: string;
    buttonAction?: () => void;
    icon: any;
    iconColor: string;
    showPaymentButton?: boolean;
  }) => (
    <Card className="border-2 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            Pedido #{order.id.slice(-4)}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {order.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem.name}
              </span>
              <span className="font-semibold">
                R$ {(item.menuItem.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        
        {order.observation && (
          <div className="bg-muted p-3 rounded-md border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Observação:</p>
            <p className="text-sm">{order.observation}</p>
          </div>
        )}

        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total:</span>
            <span className="text-xl font-black text-primary">R$ {order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <Badge variant={order.isPaid ? "default" : "secondary"} className="font-semibold">
              {order.isPaid ? "✓ Pago" : "Pendente"}
            </Badge>
            {!order.isPaid && showPaymentButton && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleMarkAsPaid(order.id)}
                className="text-xs"
              >
                Marcar como Pago
              </Button>
            )}
          </div>
        </div>

        {showButton && buttonAction && (
          <Button onClick={buttonAction} className="w-full mt-2">
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Toggle and Export Buttons */}
      {completedOrders.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTableView(!showTableView)}
            className="gap-2"
          >
            <TableIcon className="h-4 w-4" />
            {showTableView ? "Ver Cards" : "Ver Tabela"}
          </Button>
          <Button
            onClick={exportToCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      )}

      {/* Table View for Completed Orders */}
      {showTableView && completedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Pedidos Concluídos - Visualização em Tabela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(-4)}</TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.menuItem.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.observation ? (
                        <div className="text-sm max-w-xs">{order.observation}</div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      R$ {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.isPaid ? "default" : "secondary"}>
                        {order.isPaid ? "✓ Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {!showTableView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pending Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Pendentes</h2>
          <span className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-bold">
            {pendingOrders.length}
          </span>
        </div>
        {pendingOrders.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum pedido pendente
            </CardContent>
          </Card>
        ) : (
           pendingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showButton
              buttonText="Iniciar Preparação"
              buttonAction={() => handleStartPreparation(order.id)}
              icon={Clock}
              iconColor="text-amber-500"
              showPaymentButton
            />
          ))
        )}
      </div>

      {/* Preparing Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Em Preparação</h2>
          <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-bold">
            {preparingOrders.length}
          </span>
        </div>
        {preparingOrders.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum pedido em preparação
            </CardContent>
          </Card>
        ) : (
           preparingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showButton
              buttonText="Concluir Pedido"
              buttonAction={() => handleCompleteOrder(order.id)}
              icon={Package}
              iconColor="text-blue-500"
              showPaymentButton
            />
          ))
        )}
      </div>

      {/* Completed Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold">Concluídos</h2>
          <span className="bg-green-500 text-white rounded-full px-3 py-1 text-sm font-bold">
            {completedOrders.length}
          </span>
        </div>
        {completedOrders.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum pedido concluído
            </CardContent>
          </Card>
        ) : (
          completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              icon={CheckCircle2}
              iconColor="text-green-500"
            />
          ))
        )}
      </div>
        </div>
      )}
    </div>
  );
};

export default PreparationTab;
