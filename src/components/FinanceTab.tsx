import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Wallet } from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, Timestamp, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Order } from "@/pages/Index";

interface FinanceTabProps {
  orders: Order[];
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  createdAt: Date;
}

const FinanceTab = ({ orders }: FinanceTabProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estados para o formulário de nova transação
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("");

  // 1. Busca Transações do Firebase
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
        };
      }) as Transaction[];
      setTransactions(items);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cálculos Financeiros
  // Total de Vendas (Vem dos Pedidos)
  const totalSales = orders
    .filter(o => o.status === "completed")
    .reduce((acc, o) => acc + o.total, 0);

  // Total de Entradas Extras (Manual)
  const totalExtraIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  // Total de Saídas (Manual)
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // Saldo Real em Caixa
  const currentBalance = (totalSales + totalExtraIncome) - totalExpenses;

  // 3. Adicionar Transação
  const handleAddTransaction = async () => {
    if (!newDesc || !newAmount || !newCategory) {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "transactions"), {
        description: newDesc,
        amount: parseFloat(newAmount),
        type: newType,
        category: newCategory,
        createdAt: Timestamp.now(),
      });
      toast.success("Transação registrada!");
      setIsDialogOpen(false);
      // Limpa formulário
      setNewDesc("");
      setNewAmount("");
      setNewCategory("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar transação.");
    }
  };

  // 4. Deletar Transação
  const handleDelete = async (id: string) => {
    if (confirm("Deseja apagar este registro?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        toast.success("Registro apagado.");
      } catch (error) {
        toast.error("Erro ao apagar.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Lançamento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <DollarSign className="h-4 w-4" /> Vendas (Pedidos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              R$ {totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
              <ArrowUpCircle className="h-4 w-4" /> Entradas Extras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              R$ {totalExtraIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
              <ArrowDownCircle className="h-4 w-4" /> Saídas / Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              R$ {totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Saldo em Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {currentBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Lançamentos Manuais */}
      <Card>
        <CardHeader>
          <CardTitle>Livro Caixa (Movimentações Manuais)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação extra registrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.createdAt.toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "income" ? "default" : "destructive"}>
                        {t.type === "income" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      R$ {t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Nova Transação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
            <DialogDescription>Registre uma entrada ou saída de valor do caixa.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={(v: "income" | "expense") => setNewType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Saída (Despesa)</SelectItem>
                    <SelectItem value="income">Entrada (Extra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Ex: Compra de Detergente" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insumos">Insumos / Mercado</SelectItem>
                  <SelectItem value="Limpeza">Material de Limpeza</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Embalagens">Embalagens</SelectItem>
                  <SelectItem value="Doação">Doação / Aporte</SelectItem>
                  <SelectItem value="Retirada">Retirada / Sangria</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTransaction}>Salvar Lançamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceTab;