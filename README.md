# Motoboy Assistant Web

Frontend do Motoboy Assistant, uma aplicacao Angular para gerenciar corridas de motoboy. A interface permite listar, cadastrar, editar e remover corridas, alem de consultar resumo e plataformas vindos da API.

## Tecnologias

- Angular 21
- Angular Material/CDK
- TypeScript
- SCSS
- RxJS
- Vitest

## Requisitos

- Node.js compativel com Angular 21
- npm
- Backend do Motoboy Assistant rodando em `http://localhost:8080`

O endpoint base da API fica configurado em:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Por padrao, ambos usam:

```ts
apiUrl: 'http://localhost:8080'
```

## Instalacao

Instale as dependencias do projeto:

```bash
npm install
```

## Executando em desenvolvimento

Inicie o servidor local:

```bash
npm start
```

Depois acesse:

```text
http://localhost:4200
```

A aplicacao recarrega automaticamente quando os arquivos em `src/` sao alterados.

## Rotas principais

- `/corridas` - lista de corridas
- `/corridas/form` - cadastro de corrida
- `/corridas/:id/editar` - edicao de corrida

## Scripts disponiveis

```bash
npm start
```

Executa o projeto com `ng serve`.

```bash
npm run build
```

Gera a build de producao em `dist/`.

```bash
npm run watch
```

Gera build em modo desenvolvimento observando alteracoes.

```bash
npm test
```

Executa os testes unitarios.

## Estrutura do projeto

```text
src/
  app/
    features/
      rides/
        models/       # Modelos de corridas e plataformas
        pages/        # Telas de listagem e formulario
        services/     # Comunicacao com a API
      dashboard/
        components/   # Componentes de resumo
    shared/
      components/     # Dialogos reutilizaveis
      services/       # Servicos compartilhados
  environments/       # Configuracoes por ambiente
public/
  images/             # Imagens publicas da aplicacao
```

## API consumida

O frontend consome principalmente:

- `GET /api/corridas`
- `GET /api/corridas/resumo`
- `GET /api/corridas/count`
- `GET /api/corridas/:id`
- `POST /api/corridas`
- `PUT /api/corridas/:id`
- `DELETE /api/corridas/:id`
- `GET /platforms`

## Build de producao

Para gerar os arquivos finais:

```bash
npm run build
```

Os artefatos serao criados na pasta `dist/`.
