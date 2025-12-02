# 🍔 Lanchonete SH82 - Sistema de Gestão Completo

Sistema de gestão profissional desenvolvido para a Lanchonete SH82. A aplicação oferece uma solução completa "de ponta a ponta", integrando o atendimento ao cliente, a cozinha, o estoque e o controle financeiro em tempo real.

🔗 **Acesse o projeto online:** [Lanchonete SH82 - Sistema](https://diogopaf.github.io/lanchonete-sh82-sistema/)

## ✨ Funcionalidades Principais

### 🖥️ Para a Gestão (Área Administrativa - Protegida)
* **Gestão de Pedidos:** Criação ágil de pedidos com controle de múltiplos itens, observações e formas de pagamento (Pix, Dinheiro, Débito, Crédito).
* **Kanban de Preparação:** Fluxo visual para a cozinha com status "Pendente", "Em Preparação" e "Concluído".
* **Controle de Estoque Inteligente:**
    * Baixa automática de estoque ao realizar vendas.
    * Cálculo de **Preço Médio Ponderado** nas entradas de mercadoria.
    * Cálculo automático de **Margem de Lucro** por produto.
    * Histórico de movimentações.
* **💰 Módulo Financeiro (Fluxo de Caixa):**
    * Integração automática das vendas realizadas.
    * Lançamento manual de despesas (ex: limpeza, manutenção) e receitas extras.
    * Visualização do **Saldo Real** em caixa.
* **📊 Dashboard Estratégico:**
    * Gráficos de vendas por dia e por método de pagamento.
    * Indicadores de Faturamento, Lucro Estimado e Ticket Médio.
    * Ranking de produtos mais vendidos e mais lucrativos.
    * Filtros avançados por período (Hoje, 7 dias, 30 dias ou Personalizado).

### 📱 Para o Cliente (Área Pública)
* **Cardápio Digital:** Uma "vitrine" acessível via link (`/cardapio`) onde o cliente visualiza os produtos disponíveis em tempo real, sem precisar de login.

## 🛡️ Segurança e Tecnologia

* **Autenticação:** Acesso à área administrativa protegido por login e senha via Firebase Authentication.
* **Banco de Dados em Tempo Real:** Todas as alterações (pedidos, estoque, financeiro) são sincronizadas instantaneamente entre todos os dispositivos conectados usando **Firebase Firestore**.
* **Identidade Visual:** Design moderno e responsivo, adaptado para a identidade visual da marca (Tema Dark/Black).

## 🛠️ Stack Tecnológica

O projeto utiliza as tecnologias mais modernas do ecossistema React:

-   **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
-   **Gráficos:** [Recharts](https://recharts.org/)
-   **Backend (BaaS):** [Firebase](https://firebase.google.com/) (Auth & Firestore)
-   **CI/CD:** [GitHub Actions](https://github.com/features/actions) para deploy automático.

## 🚀 Como Rodar o Projeto Localmente

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Diogopaf/lanchonete-sh82-sistema.git](https://github.com/Diogopaf/lanchonete-sh82-sistema.git)
    cd lanchonete-sh82-sistema
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com as suas credenciais do Firebase:
    ```env
    VITE_FIREBASE_API_KEY="sua-chave"
    VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="seu-id"
    VITE_FIREBASE_STORAGE_BUCKET="seu-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
    VITE_FIREBASE_APP_ID="seu-app-id"
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 📦 Deploy (Publicação)

O projeto conta com um pipeline de CI/CD configurado no GitHub Actions.

1.  Faça suas alterações e envie para a branch `main`:
    ```bash
    git add .
    git commit -m "Descrição da atualização"
    git push
    ```
2.  O GitHub Actions detectará o push, fará o build da aplicação e publicará automaticamente no GitHub Pages.

---

Desenvolvido com ❤️ para a **Lanchonete SH82**.