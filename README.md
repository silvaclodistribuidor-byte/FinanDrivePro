# FinanDrive - Assistente do Motorista

Um assistente inteligente para motoristas de aplicativo acompanharem seus turnos, ganhos e métricas de desempenho usando uma interface de conversação com o poder da Gemini.

## 🚀 Demonstração ao Vivo

Este projeto está configurado para fácil implantação na Vercel.

## ✨ Funcionalidades

-   **Comandos em Linguagem Natural**: Inicie/termine turnos, registre ganhos e verifique o status usando comandos de texto simples.
-   **Métricas em Tempo Real**: Acompanhe KPIs como ganhos líquidos, R$/h e R$/km.
-   **Gerenciamento de Turnos**: Inicie, pause, retome e encerre turnos de trabalho.
-   **Registro de Ganhos**: Registre facilmente os ganhos de várias plataformas (Uber, 99, etc.).
-   **Relatórios**: Visualize relatórios de desempenho agregados para diferentes períodos de tempo.
-   **Persistência Local**: Seus dados de turno são salvos no seu navegador.

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Build Tool**: Vite
-   **IA**: Google Gemini API
-   **Implantação**: Vercel

## ⚙️ Configuração e Instalação

### Pré-requisitos

-   Node.js (v18 ou superior recomendado)
-   npm ou yarn
-   Uma Chave de API do Google Gemini

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/finandrive-assistente.git
    cd finandrive-assistente
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo chamado `.env.local` na raiz do projeto e adicione sua chave de API da Gemini:
    ```
    API_KEY="SUA_CHAVE_API_GEMINI"
    ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173`.

## 📦 Build para Produção

Para criar uma build pronta para produção do aplicativo, execute:

```bash
npm run build
```

Isso irá gerar uma pasta `dist` com os arquivos estáticos otimizados.

## ☁️ Implantação com a Vercel

1.  **Envie seu código para um repositório no GitHub.**

2.  **Importe seu projeto na Vercel:**
    -   Vá para o seu painel da Vercel e clique em "Add New... > Project".
    -   Selecione seu repositório do GitHub.
    -   A Vercel detectará automaticamente que você está usando Vite e configurará as definições de build.

3.  **Adicione as Variáveis de Ambiente:**
    -   Nas configurações do seu projeto na Vercel, vá para a seção "Environment Variables".
    -   Adicione uma nova variável com o nome `API_KEY` e sua chave de API da Gemini como valor.

4.  **Implante!** A Vercel fará o build e a implantação da sua aplicação. Quaisquer pushes subsequentes para a sua branch principal acionarão reimplantações automáticas.