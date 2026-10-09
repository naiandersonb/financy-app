This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testes de integração (Supabase local)

Os testes em `supabase/tests/` rodam contra um Supabase **local** (Docker), com as migrations de
`supabase/migrations/` aplicadas. Eles criam e apagam usuários, por isso se recusam a rodar contra
qualquer URL que não seja local.

```bash
npm run db:start          # sobe o Supabase local (a primeira vez baixa as imagens)
npm run test:integration  # roda a suíte de integração
npm run db:reset          # recria o banco local do zero com as migrations
npm run db:stop           # desliga os containers
```

Esses testes não fazem parte do `npm test` nem da cobertura, porque precisam do Docker.
