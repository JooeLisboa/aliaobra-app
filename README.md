
# AliaObra - Marketplace de Serviços de Construção

[![Feito com Next.js](https://img.shields.io/badge/Feito%20com-Next.js-black?logo=next.js)](https://nextjs.org)
[![Hospedado no Firebase](https://img.shields.io/badge/Hospedado%20no-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Pagamentos com Stripe](https://img.shields.io/badge/Pagamentos%20com-Stripe-blueviolet?logo=stripe)](https://stripe.com)
[![UI com ShadCN](https://img.shields.io/badge/UI%20com-ShadCN-black)](https://ui.shadcn.com/)

**AliaObra** é uma plataforma de marketplace moderna construída para conectar clientes que necessitam de serviços de construção e reforma com profissionais e agências qualificadas. A aplicação foi desenvolvida com Next.js, Firebase e integra a IA do Google com Genkit para uma busca inteligente de profissionais, além de pagamentos seguros com Stripe.

## ✨ Funcionalidades Principais

- **Perfis de Usuário:** Suporte para três tipos de usuários: Clientes, Profissionais (individuais) e Agências.
- **Marketplace de Serviços:** Clientes podem publicar detalhes dos serviços que precisam, incluindo categoria, descrição e orçamento.
- **Sistema de Propostas:** Profissionais e agências podem enviar propostas para os serviços publicados, e os clientes podem aceitar a melhor oferta.
- **Perfis Detalhados de Profissionais:** Profissionais podem criar perfis ricos com portfólio de trabalhos, habilidades, biografia e receber avaliações.
- **Busca Inteligente com IA:** Uma funcionalidade premium onde a IA do Google analisa a descrição de um projeto e recomenda o profissional mais adequado da plataforma.
- **Chat em Tempo Real:** Comunicação segura e direta entre clientes e profissionais dentro da plataforma, construído com Firestore.
- **Planos de Assinatura com Stripe:** Profissionais e agências podem assinar planos (Profissional, Agência) para ganhar visibilidade e acesso a funcionalidades exclusivas, como o envio de propostas.
- **Sistema de Avaliações com Análise de IA:** Clientes podem avaliar os serviços prestados, e um resumo do sentimento da avaliação pode ser gerado por IA.

## 🚀 Tecnologias Utilizadas

- **Front-end:** Next.js 14 (App Router), React, TypeScript
- **UI:** ShadCN UI, Tailwind CSS, Lucide React (ícones)
- **Back-end & Banco de Dados:** Firebase (Authentication, Firestore, Storage)
- **Inteligência Artificial:** Google Genkit
- **Pagamentos:** Stripe (Checkout e Subscriptions)
- **Validação de Formulários:** React Hook Form & Zod

## ⚙️ Configuração do Ambiente

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- Node.js (versão 20 ou superior)
- npm ou yarn
- Firebase CLI instalado e autenticado (`npm install -g firebase-tools` e `firebase login`)

### 1. Instalação das Dependências

Clone o repositório e instale as dependências do projeto.

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd aliaobra
npm install
```

### 2. Configuração do Firebase

O projeto inclui um script para facilitar a configuração do Firebase. Ele irá buscar suas credenciais de projeto e criar o arquivo `.env`.

**Importante:** Primeiro, verifique qual é o seu ID de projeto ativo no Firebase com o comando:
```bash
firebase projects:list
```
Em seguida, defina o projeto correto para trabalhar:
```bash
firebase use <seu-project-id>
```

Agora, execute o seguinte comando no terminal:
```bash
npm run setup:firebase
```

Este script irá:
1. Verificar se você está logado no Firebase CLI.
2. Detectar seu projeto Firebase ativo.
3. Encontrar sua aplicação web Firebase.
4. Gerar um arquivo `.env` na raiz do projeto com as chaves do Firebase.

### 3. Configuração do Stripe

O aplicativo usa a extensão "Run Payments with Stripe" do Firebase. Você precisa configurar seus produtos no painel do Stripe para que os planos de assinatura funcionem.

1.  **Crie os Produtos no Stripe:**
    *   Acesse seu [Dashboard do Stripe](https://dashboard.stripe.com/products).
    *   Crie dois produtos: um para o plano **Profissional** e outro para o **Agência**.
    *   **Importante:** Em cada produto, na seção "Metadados", adicione uma chave `firebaseRole` com o valor correspondente (`profissional` ou `agência`).
    *   Adicione um preço recorrente (mensal) a cada produto.
    *   **Busca Inteligente:** Crie um terceiro produto para a "Busca Inteligente por IA". Este deve ser um produto de **pagamento único**. Obtenha o ID do produto e o ID do preço.

2.  **Atualize as Variáveis de Ambiente:**
    *   Abra o arquivo `.env` gerado.
    *   Preencha a variável `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` com sua chave publicável do Stripe.
    *   No arquivo `src/app/premium-search/page.tsx`, substitua os placeholders `prod_YOUR_...` e `price_YOUR_...` pelos IDs reais do produto de pagamento único que você criou.

### 4. Configuração da IA (Google Genkit)

1.  Obtenha uma API Key no [Google AI Studio](https://aistudio.google.com/).
2.  No arquivo `.env`, adicione sua chave à variável `GOOGLE_API_KEY`.

### 5. Executando a Aplicação Localmente

Com tudo configurado, você pode iniciar o servidor de desenvolvimento.

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 6. Deploy (Publicação) da Aplicação

Este projeto está configurado para o Firebase App Hosting. O deploy é feito através da sua integração com o GitHub.

1.  Conecte seu repositório do GitHub ao Firebase App Hosting.
2.  O Firebase criará um fluxo de trabalho (GitHub Action) que fará o deploy automaticamente toda vez que você enviar um commit para a sua branch principal (`master` ou `main`).

Você também pode fazer o deploy manual das regras do Firestore (se alteradas) com:
```bash
firebase deploy --only firestore --project <seu-project-id>
```

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento do Next.js.
- `npm run build`: Compila a aplicação para produção.
- `npm run start`: Inicia um servidor de produção.
- `npm run lint`: Executa o linter para verificar a qualidade do código.
- `npm run setup:firebase`: Script auxiliar para configurar as variáveis de ambiente do Firebase.
