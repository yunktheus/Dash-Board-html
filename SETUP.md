# Studium — Setup Guide

## Rodando localmente

```bash
npm install
npm run dev
```

O app abre em http://localhost:3000. Funciona offline usando `localStorage` — sem Firebase necessário para usar as features básicas.

---

## Configurando Firebase (sync na nuvem + upload de arquivos)

### 1. Criar o projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto** → dê um nome (ex: `studium-app`)
3. Desative o Google Analytics se quiser e clique em **Criar projeto**

### 2. Habilitar serviços

**Authentication:**
- No menu lateral: **Authentication → Primeiros passos**
- Aba **Sign-in method** → habilite **Google**

**Firestore:**
- No menu lateral: **Firestore Database → Criar banco de dados**
- Escolha **Modo de produção** → selecione a região mais próxima → **Ativar**

**Storage:**
- No menu lateral: **Storage → Primeiros passos**
- Escolha **Modo de produção** → **Concluído**

### 3. Obter as credenciais

- No menu lateral: **Configurações do projeto (ícone ⚙️) → Configurações gerais**
- Role até **Seus apps** → clique em **</>** (Web)
- Registre o app → copie o objeto `firebaseConfig`

### 4. Criar o arquivo `.env.local`

Na raiz do projeto, copie `.env.local.example` para `.env.local` e preencha com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc...
```

### 5. Fazer deploy das regras de segurança

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # selecione seu projeto
firebase deploy --only firestore:rules,storage
```

---

## Deploy no Vercel (recomendado)

1. Faça push do código para o GitHub
2. Importe o repositório em [vercel.com](https://vercel.com)
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
4. **Deploy** — Vercel detecta Next.js automaticamente

---

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Firebase 12** (Auth, Firestore, Storage)
- **React 19**
- **date-fns, lucide-react, clsx, tailwind-merge**
