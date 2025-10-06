import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/pages/Index";

interface MenuTabProps {
  menuItems: MenuItem[];
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: Omit<MenuItem, "id">) => void;
}

const MenuTab = ({ menuItems, onUpdateItem, onDeleteItem, onAddItem }: MenuTabProps) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
      stock: 0,
      visible: true,
    });
    setIsAdding(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    if (!editingItem.name || editingItem.price <= 0 || editingItem.stock < 0) {
      toast.error("Preencha todos os campos corretamente!");
      return;
    }

    if (isAdding) {
      onAddItem({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        stock: editingItem.stock,
        visible: editingItem.visible,
      });
      toast.success("Item adicionado com sucesso!");
    } else {
      onUpdateItem(editingItem);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gerenciar Cardápio</h2>
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estoque:</span>
                  <span className="text-lg font-semibold">{item.stock} unidades</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={item.visible ? "outline" : "secondary"}
                  size="icon"
                  onClick={() => onUpdateItem({ ...item, visible: !item.visible })}
                  title={item.visible ? "Ocultar dos pedidos" : "Mostrar nos pedidos"}
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
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isAdding ? "Adicionar Item" : "Editar Item"}
            </DialogTitle>
            <DialogDescription>
              {isAdding 
                ? "Preencha as informações do novo item do cardápio"
                : "Altere as informações do item do cardápio"
              }
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  placeholder="Nome do item"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="Descrição do item"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingItem.stock}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, stock: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuTab;
