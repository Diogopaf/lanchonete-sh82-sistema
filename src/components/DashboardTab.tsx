import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order } from "@/pages/Index";
import { DollarSign, ShoppingBag, TrendingUp, Calendar, Coins } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Progress } from "@/components/ui/progress"; // Importação do componente de barra de progresso

interface DashboardTabProps {
  orders: Order[];
}

const DashboardTab = ({ orders }: DashboardTabProps) => {
  const [timeRange, setTimeRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Função para filtrar os pedidos com base no período selecionado
  const filteredOrders = orders.filter(order => {
    if (order.status !== "completed") return false;
    if (timeRange === "all") return true;

    const orderDate = new Date(order.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    orderDate.setHours(0, 0, 0, 0);
    const orderTime = orderDate.getTime();

    if (timeRange === "today") return orderTime === today.getTime();

    if (timeRange === "7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }

    if (timeRange === "30days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }

    if (timeRange === "custom") {
      let matchesStart = true;
      let matchesEnd = true;

      if (customStart) {
        const [y, m, d] = customStart.split('-').map(Number);
        const startDate = new Date(y, m - 1, d);
        startDate.setHours(0, 0, 0, 0);
        matchesStart = orderTime >= startDate.getTime();
      }

      if (customEnd) {
        const [y, m, d] = customEnd.split('-').map(Number);
        const endDate = new Date(y, m - 1, d);
        endDate.setHours(0, 0, 0, 0);
        matchesEnd = orderTime <= endDate.getTime();
      }

      return matchesStart && matchesEnd;
    }

    return true;
  });

  // 1. Cálculos Gerais
  const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalProfit = filteredOrders.reduce((acc, order) => {
    const orderProfit = order.items.reduce((itemAcc, item) => {
      const cost = item.menuItem.costPrice || 0;
      const price = item.menuItem.price;
      return itemAcc + ((price - cost) * item.quantity);
    }, 0);
    return acc + orderProfit;
  }, 0);

  // 2. Dados para Gráfico de Pagamento
  const paymentDataRaw = filteredOrders.reduce((acc, order) => {
    const method = order.paymentMethod || "pix";
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const translatePayment = (method: string) => {
    const map: Record<string, string> = {
      pix: "Pix",
      money: "Dinheiro",
      credit: "Crédito",
      debit: "Débito"
    };
    return map[method] || method;
  };

  const paymentData = Object.entries(paymentDataRaw).map(([name, value]) => ({
    name: translatePayment(name),
    value,
  }));

  const COLORS = ['#000000', '#4b5563', '#9ca3af', '#e5e7eb']; 

  // 3. Dados para Gráfico de Dias da Semana
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayDataRaw = filteredOrders.reduce((acc, order) => {
    const day = daysOfWeek[order.createdAt.getDay()];
    acc[day] = (acc[day] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const dayData = daysOfWeek.map(day => ({
    name: day,
    total: dayDataRaw[day] || 0
  }));

  // 4. Top Produtos (Quantidade)
  const productDataRaw = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productDataRaw)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  // NOVO: Lucratividade por Produto (Valor Monetário)
  const productProfitRaw = filteredOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const cost = item.menuItem.costPrice || 0;
      const profit = (item.menuItem.price - cost) * item.quantity;
      acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + profit;
    });
    return acc;
  }, {} as Record<string, number>);

  const productProfits = Object.entries(productProfitRaw)
    .sort(([, a], [, b]) => b - a)
    .map(([name, profit]) => ({ name, profit }));

  const maxProductProfit = productProfits.length > 0 ? productProfits[0].profit : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h2 className="text-2xl font-bold">Dashboard Gerencial</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
          {timeRange === "custom" && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-md border animate-in fade-in slide-in-from-right-4">
              <Input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 w-auto border-0 focus-visible:ring-0"
              />
              <span className="text-muted-foreground">-</span>
              <Input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 w-auto border-0 focus-visible:ring-0"
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-white p-1 rounded-md border">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] border-0 focus:ring-0 shadow-none">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Margem: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Concluídos no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Média por pedido</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vendas por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produtos por Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos (Volume)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} unidades vendidas
                    </p>
                  </div>
                  <div className="font-bold text-sm">
                    {product.quantity} un
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhum dado de venda neste período.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NOVO: Lucratividade por Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Lucratividade por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {productProfits.slice(0, 5).map((product, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-green-600 font-semibold">R$ {product.profit.toFixed(2)}</span>
                  </div>
                  <Progress value={(product.profit / maxProductProfit) * 100} className="h-2" />
                </div>
              ))}
              {productProfits.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhum dado de lucro neste período.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;