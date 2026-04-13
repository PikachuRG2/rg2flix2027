# RG2 Player - Netflix Clone Moderno

Este é um projeto de clone da Netflix moderno e responsivo, construído com React, TypeScript e Tailwind CSS.

## Funcionalidades
- **Autenticação**: Login e Cadastro com persistência local.
- **Planos**: Escolha de planos (Básico, Padrão, Premium).
- **Home**: Banner dinâmico e várias linhas de conteúdo consumindo a API do TMDB.
- **Painel de Admin**: Gerenciamento de usuários e conteúdo.
- **Responsivo**: Design adaptado para desktop e mobile.

## Como Executar
1. Instale as dependências: `npm install`
2. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```env
   VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE
   VITE_TMDB_KEY=SUA_CHAVE_DA_API_TMDB
   ```
3. Inicie o servidor de desenvolvimento: `npm run dev`

## Tecnologias
- React 18
- TypeScript
- Tailwind CSS (com scrollbar-hide)
- Framer Motion (animações)
- Lucide React (ícones)
- Axios (API)
- Vite
