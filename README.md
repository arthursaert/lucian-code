# Lucian Code

> Alternativa gratuita e open-source ao Claude Code. Agente de codificação para o terminal com suporte a modelos locais via Ollama, OpenRouter e Maritaca AI.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20.6-green)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20windows%20%7C%20macos-lightgrey)

---

## Por que Lucian Code?

Ferramentas como Claude Code e Cursor são poderosas, mas caras e fechadas. O Lucian Code nasce como alternativa real:

| | Lucian Code | Claude Code |
|---|---|---|
| Custo | Gratuito (Ollama) ou pay-per-use | Assinatura obrigatória |
| Modelos locais | ✅ via Ollama | ❌ |
| Open-source | ✅ | ❌ |
| Modelos brasileiros | ✅ Maritaca AI | ❌ |
| Customização por projeto | ✅ LUCIAN.md | ✅ CLAUDE.md |

---

## Características

- **3 modos de operação**: Chat, Plan e Build
- **Modelos locais via Ollama**: rode de graça, sem API key, sem internet
- **Maritaca AI**: suporte nativo ao Sabiá-3 e outros modelos brasileiros
- **OpenRouter**: acesso a 100+ modelos (GPT-4o, Claude, Gemini, Llama...)
- **Troca dinâmica de modelos**: mude o modelo sem reiniciar a sessão
- **Execução agêntica real**: cria, edita e gerencia arquivos no sistema
- **LUCIAN.md**: customização de comportamento por projeto
- **Memória de sessão**: mantém contexto durante a conversa
- **Arquitetura modular**: fácil de estender com novos providers

---

## Requisitos

- Node.js 20.6 ou superior
- Uma das opções abaixo:
  - [Ollama](https://ollama.ai) instalado localmente *(grátis, sem API key)*
  - Chave de API do [OpenRouter](https://openrouter.ai) *(pay-per-use)*
  - Chave de API da [Maritaca AI](https://maritaca.ai) *(modelos brasileiros)*

---

## Instalação

```bash
git clone https://github.com/arthurg-santos/lucian-code.git
cd lucian-code
npm install
```

### Configurando providers

Crie um arquivo `.env` na raiz do projeto:

```env
# OpenRouter (opcional)
OPENROUTER_API_KEY=sua_chave_aqui

# Maritaca AI (opcional)
MARITACA_API_KEY=sua_chave_aqui

# Ollama não precisa de chave — apenas instale e rode localmente
```

### Compilando para executável

```bash
# Instalar Bun (se ainda não tiver)
curl -fsSL https://bun.sh/install | bash

# Compilar para todas as plataformas
npm run build:all

# Ou compilar para uma plataforma específica
npm run build:linux       # Linux x64
npm run build:win         # Windows x64
npm run build:macos       # macOS x64
npm run build:macos-arm   # macOS ARM (Apple Silicon)
```

Os executáveis serão gerados em `dist/`.

---

## Uso

```bash
npm start
```

Ou via executável compilado:

```bash
./bin/lucian-linux   # Linux
./bin/lucian.exe     # Windows
./bin/lucian-macos   # macOS
```

### Modos de operação

**Chat Mode** (padrão) — conversa direta, sem executar ações.

**Plan Mode** — analisa a solicitação e produz um plano com objetivo, etapas, riscos e dependências. Nenhuma execução ocorre.

**Build Mode** — executa o plano passo a passo, criando e editando arquivos no sistema.

### Exemplo de uso

```
lucian> /build
Switched to BUILD MODE.

lucian> Crie um servidor Express com rotas para CRUD de usuários

[Tool Call] create_directory
Parameters: { "path": "user-api" }
Result: Directory created: user-api

[Tool Call] create_file
Parameters: { "path": "user-api/server.js", "content": "..." }
Result: File created: user-api/server.js

--- Agent Output ---
Projeto criado com sucesso. Para executar:
1. cd user-api
2. npm install
3. npm start
--------------------
```

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `/help` | Exibe todos os comandos |
| `/chat` | Alterna para Chat Mode |
| `/plan` | Alterna para Plan Mode |
| `/build` | Alterna para Build Mode |
| `/switch-model <modelo>` | Define o modelo ativo |
| `/set-fallback <modelo>` | Define o modelo de fallback |
| `/models` | Mostra a configuração atual |
| `/status` | Exibe o estado atual |
| `/reset` | Limpa a memória da sessão |

### Providers e modelos

**Ollama (local, gratuito)**
```bash
# Instale o modelo antes de usar
ollama pull llama3.2
ollama pull qwen2.5-coder

# No Lucian:
lucian> /switch-model ollama/llama3.2
```

**Maritaca AI (modelos brasileiros)**
```bash
lucian> /switch-model sabia-3
```

**OpenRouter**
```bash
lucian> /switch-model qwen/qwen3.7-plus          # padrão
lucian> /switch-model anthropic/claude-3.5-sonnet
lucian> /switch-model openai/gpt-4o
lucian> /switch-model meta-llama/llama-3.1-405b-instruct
```

---

## Customização por Projeto (LUCIAN.md)

Crie um `LUCIAN.md` na raiz do projeto onde você executa o CLI. Ele é carregado automaticamente e injetado no system prompt em todos os modos.

```markdown
# LUCIAN.md

## Project Overview
API REST em Node.js com Express e PostgreSQL via Prisma.

## Tech Stack
- Language: TypeScript
- Framework: Express
- Database: PostgreSQL (Prisma ORM)

## Code Style
- Use ES Modules
- Prefer async/await
- File names: kebab-case

## Regras
- Nunca use console.log — use o Logger em src/utils/logger.js
- Não instale dependências sem perguntar primeiro
```

---

## Arquitetura

```
src/
├── index.js              # Ponto de entrada CLI
├── cli/
│   ├── commands.js       # Parser e roteador de comandos
│   └── ui.js             # Renderização da interface
├── agent/
│   ├── core.js           # Loop principal do agente
│   ├── modes.js          # Lógica de modos e prompts
│   └── tools.js          # Definição e execução de ferramentas
├── core/
│   └── config.js         # Configurações globais
├── providers/
│   ├── base.js           # Interface abstrata de provider
│   ├── openrouter.js     # Implementação OpenRouter
│   ├── ollama.js         # Implementação Ollama (local)
│   └── maritaca.js       # Implementação Maritaca AI
├── memory/
│   └── store.js          # Gerenciamento de memória de sessão
└── utils/
    └── logger.js         # Utilitário de logging
```

### Ciclo do agente

```
INPUT → ANALYZE → PLAN → EXECUTE → VERIFY → OUTPUT
```

Cada etapa é explícita e registrada. Em Build Mode, o ciclo inclui chamadas de ferramentas com confirmação antes de modificar o sistema de arquivos.

### Ferramentas disponíveis em Build Mode

| Ferramenta | O que faz |
|---|---|
| `create_file` | Cria novos arquivos |
| `edit_file` | Substitui o conteúdo completo de um arquivo |
| `replace_in_file` | Substitui padrões de texto específicos |
| `insert_at_line` | Insere conteúdo em uma linha específica |
| `delete_file` | Remove arquivos |
| `create_directory` | Cria diretórios |
| `list_files` | Lista conteúdo de diretórios |
| `read_file` | Lê o conteúdo de arquivos |

---

## Contribuindo

Contribuições são bem-vindas — especialmente novos providers e ferramentas.

### Rodando localmente para desenvolvimento

```bash
git clone https://github.com/arthurg-santos/lucian-code.git
cd lucian-code
npm install
cp .env.example .env   # configure suas chaves
npm start
```

### Adicionando um novo provider

1. Crie `src/providers/seu-provider.js` seguindo a interface de `src/providers/base.js`
2. Registre no arquivo de configuração em `src/core/config.js`
3. Adicione os modelos suportados na tabela do README
4. Abra um PR com um exemplo de uso

### Fluxo de contribuição

```bash
git checkout -b feature/minha-feature
git commit -m 'feat: adiciona suporte a X'
git push origin feature/minha-feature
# Abra um Pull Request
```

> Procurando por onde começar? Veja as issues marcadas com `good first issue`.

---

## Roadmap

- [x] Suporte a OpenRouter
- [x] Suporte a Ollama (modelos locais)
- [x] Suporte a Maritaca AI
- [x] Customização por projeto via LUCIAN.md
- [ ] Execução de comandos shell
- [ ] Integração com git
- [ ] Sistema de plugins/skills
- [ ] Testes automatizados

---

## Licença

MIT — veja [LICENSE](LICENSE) para detalhes.

---

Feito com foco em simplicidade e utilidade real.
