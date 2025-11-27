import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/pages/Index";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface DashboardTabProps {
  orders: Order[];
}

const DashboardTab = ({ orders }: DashboardTabProps) => {
  // Filtra apenas pedidos concluídos para as estatísticas
  const completedOrders = orders.filter(order => order.status === "completed");

  // 1. Cálculos Gerais
  const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = completedOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 2. Dados para Gráfico de Pagamento
  const paymentDataRaw = completedOrders.reduce((acc, order) => {
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

  const COLORS = ['#000000', '#4b5563', '#9ca3af', '#e5e7eb']; // Tons de cinza/preto para combinar com o tema

  // 3. Dados para Gráfico de Dias da Semana
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayDataRaw = completedOrders.reduce((acc, order) => {
    const day = daysOfWeek[order.createdAt.getDay()];
    acc[day] = (acc[day] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const dayData = daysOfWeek.map(day => ({
    name: day,
    total: dayDataRaw[day] || 0
  }));

  // 4. Top Produtos
  const productDataRaw = completedOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productDataRaw)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Gerencial</h2>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Em pedidos concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Pedidos finalizados</p>
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
        {/* Gráfico de Vendas por Dia */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vendas por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$${value}`} 
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Métodos de Pagamento */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
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

      {/* Lista de Top Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
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
                <div className="font-bold">
                  {(product.quantity / (completedOrders.reduce((acc, o) => acc + o.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0) || 1) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum dado de venda disponível.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;