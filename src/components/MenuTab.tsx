import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Eye, EyeOff, PackagePlus, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/pages/Index";
import { Badge } from "@/components/ui/badge";

interface MenuTabProps {
  menuItems: MenuItem[];
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: Omit<MenuItem, "id">) => void;
  // Nova prop para lidar com a entrada inteligente
  onStockEntry: (itemId: string, quantity: number, newCost: number) => void;
}

const MenuTab = ({ menuItems, onUpdateItem, onDeleteItem, onAddItem, onStockEntry }: MenuTabProps) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Estados para o Modal de Entrada de Estoque
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [itemToRestock, setItemToRestock] = useState<MenuItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<string>("");
  const [restockCost, setRestockCost] = useState<string>(""); // NOVO: Custo da nova remessa

  // Funções de Edição / Adição
  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsAdding(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem({
      id: "",
      name: "",
      description: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      visible: true,
    });
    setIsAdding(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    if (!editingItem.name || editingItem.price < 0 || editingItem.stock < 0) {
      toast.error("Preencha os campos corretamente!");
      return;
    }

    const itemToSave = {
      ...editingItem,
      costPrice: Number(editingItem.costPrice) || 0
    };

    if (isAdding) {
      onAddItem({
        name: itemToSave.name,
        description: itemToSave.description,
        price: itemToSave.price,
        costPrice: itemToSave.costPrice,
        stock: itemToSave.stock,
        visible: itemToSave.visible,
      });
      toast.success("Item adicionado com sucesso!");
    } else {
      onUpdateItem(itemToSave);
      toast.success("Item atualizado com sucesso!");
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDelete = (itemId: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      onDeleteItem(itemId);
      toast.success("Item excluído!");
    }
  };

  // Funções de Entrada de Estoque
  const openRestockDialog = (item: MenuItem) => {
    setItemToRestock(item);
    setRestockQuantity("");
    setRestockCost(""); // Limpa o custo
    setIsRestockDialogOpen(true);
  };

  const handleConfirmRestock = () => {
    if (itemToRestock && restockQuantity) {
      const quantityToAdd = parseInt(restockQuantity);
      // Se o usuário não digitar custo, assumimos o custo atual do item para não quebrar o cálculo
      const newBatchCost = restockCost ? parseFloat(restockCost) : (itemToRestock.costPrice || 0);

      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        toast.error("Digite uma quantidade válida!");
        return;
      }

      // Chama a nova função inteligente
      onStockEntry(itemToRestock.id, quantityToAdd, newBatchCost);
      
      setIsRestockDialogOpen(false);
      setItemToRestock(null);
      setRestockQuantity("");
      setRestockCost("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Estoque & Cardápio</h2>
        <Button onClick={handleAdd} size="lg" className="w-full sm:w-auto">
          <Plus className="h-5 w-5 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => {
          // Cálculos de Lucro
          const cost = item.costPrice || 0;
          const profit = item.price - cost;
          const margin = item.price > 0 ? (profit / item.price) * 100 : 0;
          const isLowStock = item.stock < 10;

          return (
            <Card key={item.id} className={`border-2 hover:shadow-lg transition-all ${isLowStock ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {item.name}
                    {isLowStock && (
                      <div className="group relative">
                        <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                      </div>
                    )}
                  </CardTitle>
                  <Badge variant={item.visible ? "default" : "secondary"}>
                    {item.visible ? "Visível" : "Oculto"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 h-10">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                
                {/* Informações de Preço e Lucro */}
                <div className="bg-background/50 p-3 rounded-lg border space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Venda:</span>
                    <span className="font-bold text-lg">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Custo Médio:</span>
                    <span>R$ {cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1 border-t mt-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Lucro Est.:
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      R$ {profit.toFixed(2)} ({margin.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Informações de Estoque */}
                <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border">
                  <span className="text-sm font-medium">Estoque Atual:</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {item.stock}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 bg-background hover:bg-primary hover:text-primary-foreground"
                      onClick={() => openRestockDialog(item)}
                      title="Adicionar Entrada de Estoque"
                    >
                      <PackagePlus className="h-4 w-4 mr-1" /> Entrada
                    </Button>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateItem({ ...item, visible: !item.visible })}
                    title={item.visible ? "Ocultar do Cardápio" : "Mostrar no Cardápio"}
                  >
                    {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de Edição / Criação (Mantido Simples) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isAdding ? "Novo Produto" : "Editar Produto"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do produto.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex: X-Salada"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Ingredientes, tamanho..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço de Venda (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                {/* No modo de edição, o custo é apenas visualização ou ajuste manual se necessário */}
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Custo Médio Atual (R$)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItem.costPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              {isAdding && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque Inicial</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem({ ...editingItem, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Entrada de Estoque (RESTOCK) */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              Entrada de Estoque
            </DialogTitle>
            <DialogDescription>
              Registrar nova compra de <strong>{itemToRestock?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center p-3 bg-muted rounded-lg min-w-[80px]">
                <span className="block text-xs text-muted-foreground">Atual</span>
                <span className="text-2xl font-bold">{itemToRestock?.stock}</span>
              </div>
              <Plus className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="restock-qty">Quantidade (Unidades)</Label>
                <Input
                  id="restock-qty"
                  type="number"
                  min="1"
                  autoFocus
                  placeholder="Ex: 20"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-cost">Custo Unitário DESTA Compra (R$)</Label>
              <Input
                id="restock-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder={`Custo anterior: R$ ${itemToRestock?.costPrice.toFixed(2)}`}
                value={restockCost}
                onChange={(e) => setRestockCost(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Isso atualizará o custo médio ponderado do produto.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmRestock}>
              Confirmar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuTab;