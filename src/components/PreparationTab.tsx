import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Package, Download, Table as TableIcon, ArrowLeft, Search, Calendar, Filter, X, Pencil, QrCode, Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";
import type { Order } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

interface PreparationTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onUpdatePayment: (orderId: string, isPaid: boolean, paymentMethod?: Order["paymentMethod"]) => void;
}

const PreparationTab = ({ orders, onUpdateStatus, onUpdatePayment }: PreparationTabProps) => {
  const { playOrderCompletedSound } = useSound();
  const [showTableView, setShowTableView] = useState(false);
  
  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Estados para o Modal de Pagamento
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Order["paymentMethod"]>("pix");

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter((order) => order.status === "preparing");
  const completedOrders = orders.filter((order) => order.status === "completed");

  const filteredCompletedOrders = completedOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter;

    let matchesDate = true;
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    const orderTime = orderDate.getTime();

    if (dateStart) {
      const [y, m, d] = dateStart.split('-').map(Number);
      const startDate = new Date(y, m - 1, d);
      startDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && orderTime >= startDate.getTime();
    }

    if (dateEnd) {
      const [y, m, d] = dateEnd.split('-').map(Number);
      const endDate = new Date(y, m - 1, d);
      endDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && orderTime <= endDate.getTime();
    }

    return matchesSearch && matchesPayment && matchesDate;
  });

  const totalAmount = filteredCompletedOrders.reduce((acc, order) => acc + order.total, 0);

  const translatePayment = (method: string) => {
    const map: Record<string, string> = {
      pix: "Pix",
      money: "Dinheiro",
      credit: "Crédito",
      debit: "Débito"
    };
    return map[method] || method;
  };

  const exportToCSV = () => {
    const headers = ["Pedido", "Data", "Horário", "Itens", "Método Pgto", "Total", "Status Pagamento"];
    const rows = filteredCompletedOrders.map(order => [
      `#${order.id.slice(-4)}`,
      order.createdAt.toLocaleDateString("pt-BR"),
      order.createdAt.toLocaleTimeString("pt-BR"),
      order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join("; "),
      translatePayment(order.paymentMethod || "pix"),
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
    link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório exportado com sucesso!");
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

  const handleMoveBack = (orderId: string, currentStatus: Order["status"]) => {
    const previousStatus = currentStatus === "preparing" ? "pending" : "preparing";
    onUpdateStatus(orderId, previousStatus);
    toast.info(`Pedido movido para a etapa anterior.`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("all");
    setDateStart("");
    setDateEnd("");
  };

  // FUNÇÕES PARA O MODAL DE PAGAMENTO
  const openPaymentDialog = (order: Order) => {
    setSelectedOrderForPayment(order);
    setSelectedPaymentMethod(order.paymentMethod || "pix"); // Carrega o método atual ou pix
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (selectedOrderForPayment) {
      onUpdatePayment(selectedOrderForPayment.id, true, selectedPaymentMethod);
      toast.success("Pagamento registrado!");
      setIsPaymentDialogOpen(false);
      setSelectedOrderForPayment(null);
    }
  };

  const OrderCard = ({ order, showButton, buttonText, buttonAction, icon: Icon, iconColor, showPaymentButton, showBackButton, backButtonAction }: {
    order: Order;
    showButton?: boolean;
    buttonText?: string;
    buttonAction?: () => void;
    icon: any;
    iconColor: string;
    showPaymentButton?: boolean;
    showBackButton?: boolean;
    backButtonAction?: () => void;
  }) => (
    <Card className="border-2 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-muted"
                onClick={(e) => { e.stopPropagation(); backButtonAction?.(); }}
                title="Mover para etapa anterior"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              Pedido #{order.id.slice(-4)}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted-foreground">
              {translatePayment(order.paymentMethod || "pix")}
            </span>
            <span className="text-xs text-muted-foreground">
              {order.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
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
            <Badge 
              variant={order.isPaid ? "default" : "secondary"} 
              className={`font-semibold ${order.isPaid ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {order.isPaid ? "✓ Pago" : "Pendente"}
            </Badge>
            
            {/* Botão de Pagar ou Editar Pagamento */}
            {!order.isPaid && showPaymentButton ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openPaymentDialog(order)}
                className="text-xs"
              >
                Pagar
              </Button>
            ) : (
              // Botão discreto para editar pagamento se já estiver pago
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                title="Alterar forma de pagamento"
                onClick={() => openPaymentDialog(order)}
              >
                <Pencil className="h-3 w-3" />
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold hidden sm:block">Gerenciamento</h2>
        {completedOrders.length > 0 && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowTableView(!showTableView)}
              className="gap-2 flex-1 sm:flex-none"
            >
              <TableIcon className="h-4 w-4" />
              {showTableView ? "Ver Cards" : "Ver Relatório"}
            </Button>
            {showTableView && (
              <Button
                onClick={exportToCSV}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        )}
      </div>

      {showTableView && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" /> Buscar Pedido/Produto
                </label>
                <Input 
                  placeholder="Ex: Coxinha ou #1234" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Pagamento
                </label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="money">Dinheiro</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> De
                </label>
                <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Até
                </label>
                <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
              </div>
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-2" /> Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showTableView && completedOrders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Histórico de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompletedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhum pedido encontrado com esses filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompletedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(-4)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.createdAt.toLocaleDateString("pt-BR")}</span>
                            <span className="text-xs text-muted-foreground">{order.createdAt.toLocaleTimeString("pt-BR")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-bold">{item.quantity}x</span> {item.menuItem.name}
                              </div>
                            ))}
                            {order.observation && (
                              <span className="text-xs text-muted-foreground italic">Obs: {order.observation}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {translatePayment(order.paymentMethod || "pix")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.isPaid ? "default" : "destructive"}>
                            {order.isPaid ? "Pago" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          R$ {order.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-bold text-lg">Total do Período</TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">
                      R$ {totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  showBackButton
                  backButtonAction={() => handleMoveBack(order.id, "preparing")}
                />
              ))
            )}
          </div>

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
                  showBackButton
                  backButtonAction={() => handleMoveBack(order.id, "completed")}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE PAGAMENTO */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Selecione a forma de pagamento</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={(value: Order["paymentMethod"]) => setSelectedPaymentMethod(value)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> Pix
                    </div>
                  </SelectItem>
                  <SelectItem value="money">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" /> Dinheiro
                    </div>
                  </SelectItem>
                  <SelectItem value="debit">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Cartão de Débito
                    </div>
                  </SelectItem>
                  <SelectItem value="credit">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Cartão de Crédito
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreparationTab;