# Frontend IQuadra

Frontend em Next.js 16 com App Router.

## Estrutura

```text
frontend/
  app/        # rotas, layouts e entrypoints finos
  features/   # UI e comportamento por domínio de negócio
  shared/     # tipos, serviços, helpers e layout reutilizável
  public/     # arquivos estáticos
```

## Convenções

- `app/` deve ficar focado em roteamento.
- `features/` concentra componentes e fluxos de tela.
- `shared/lib/` guarda utilitários puros e helpers transversais.
- `shared/services/` concentra acesso à API.
- `shared/types/` centraliza contratos tipados.
- Prefira imports com `@/` em vez de caminhos relativos longos.

## Features atuais

```text
features/
  auth/
    components/
  landing/
    components/
  painel/
    components/
      academia/
```

## Desenvolvimento

```bash
cmd /c npm run dev
cmd /c npm run lint
cmd /c npx tsc --noEmit
```
