# SmartSupport Frontend

Frontend do sistema de agendamento SaaS construído com React + Vite + TypeScript.

## Tecnologias

- React 18
- Vite
- TypeScript
- React Router DOM
- Axios
- Tailwind CSS (via CDN ou instalar)

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o .env com a URL da API
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:5173`

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Context API (AuthContext)
│   ├── pages/          # Páginas da aplicação
│   ├── routes/         # Configuração de rotas
│   ├── services/       # Serviços de API
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Funções utilitárias
```

## Autenticação

O sistema usa Context API para gerenciar autenticação:
- Tokens armazenados no localStorage
- Interceptor do Axios adiciona token automaticamente
- Refresh token automático em caso de expiração

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Preview da build de produção

## Nota sobre Tailwind CSS

Este projeto usa classes Tailwind CSS. Para funcionar completamente, você precisa:

1. Instalar Tailwind CSS:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configurar `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Ou usar o CDN do Tailwind no `index.html` temporariamente.
