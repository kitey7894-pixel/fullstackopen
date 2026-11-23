# Bloglist backend — Full Stack Open part 4

Exercícios 4.1–4.23: API de blogs com testes, usuários e autenticação por token (JWT).

## Rodando

```bash
npm install
# .env:
# MONGODB_URI=<connection string do Atlas, banco bloglist>
# TEST_MONGODB_URI=<connection string do Atlas, banco bloglist-test>
# SECRET=<qualquer string secreta pro JWT>
# PORT=3003
npm run dev
```

## Testes

```bash
npm test           # todos (unitários + API)
npm run lint
```

Os testes de API usam o banco de TEST_MONGODB_URI e limpam ele a cada teste.
