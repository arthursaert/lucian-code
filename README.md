# Lucian Code

Um assistente de codificação agêntico de código aberto, construído com Node.js. Projetado para desenvolvedores que precisam de um parceiro de programação no terminal.

## Sobre

Lucian Code não é apenas um chatbot. É um agente que raciocina, planeja e executa ações em um pipeline estruturado. Ele interpreta suas solicitações, divide tarefas complexas em etapas gerenciáveis e executa cada passo com confirmação explícita.

## Características

- **Modos de operação**: Chat, Plan e Build
- **Troca dinâmica de modelos**: Use qualquer modelo disponível no OpenRouter
- **Execução agêntica real**: Cria, edita e gerencia arquivos no sistema
- **Memória de sessão**: Mantém contexto durante a sessão
- **Interface limpa**: Terminal UI minimalista, sem distrações
- **Extensível**: Arquitetura modular preparada para plugins

## Requisitos

- Node.js 18 ou superior
- Uma chave de API do OpenRouter (https://openrouter.ai)

## Instalação

### Do código fonte

```bash
git clone https://github.com/seu-usuario/lucian-code.git
cd lucian-code
npm install
```

### Configurando a API

Crie um arquivo `.env` na raiz do projeto:

```env
OPENROUTER_API_KEY=sua_chave_aqui
```

Ou exporte a variável de ambiente no seu terminal:

```bash
export OPENROUTER_API_KEY=sua_chave_aqui
```

### Compilando para executável

O projeto pode ser compilado para Windows, Linux e macOS usando Bun:

```bash
# Instalar Bun (se ainda não tiver)
curl -fsSL https://bun.sh/install | bash

# Compilar para todas as plataformas
npm run build:all

# Ou compilar para uma plataforma específica
npm run build:linux   # Linux x64
npm run build:win     # Windows x64
npm run build:macos   # macOS x64
npm run build:macos-arm  # macOS ARM (Apple Silicon)
```

Os executáveis serão gerados em `dist/`.

## Uso

### Executando com Node.js

```bash
npm start
```

### Executando o executável compilado

```bash
./bin/lucian-linux    # Linux
./bin/lucian.exe      # Windows
./bin/lucian-macos    # macOS
```

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `/help` | Exibe todos os comandos disponíveis |
| `/chat` | Alterna para o modo Chat (conversa direta) |
| `/plan` | Alterna para o modo Plan (apenas planejamento) |
| `/build` | Alterna para o modo Build (execução agêntica) |
| `/switch-model <modelo>` | Define o modelo ativo (ex: `anthropic/claude-3.5-sonnet`) |
| `/set-fallback <modelo>` | Define o modelo de fallback |
| `/models` | Mostra a configuração atual de modelos |
| `/status` | Exibe o estado atual do sistema |
| `/reset` | Limpa a memória da sessão |

### Modos de operação

**Chat Mode** (padrão)
Conversa direta com o modelo. Responde perguntas e explica conceitos sem executar ações.

**Plan Mode**
O agente analisa sua solicitação e produz um plano estruturado contendo objetivo, etapas, riscos e dependências. Nenhuma execução ocorre neste modo.

**Build Mode**
O agente executa o plano passo a passo, criando e editando arquivos no sistema. Cada ação é registrada e pode ser acompanhada em tempo real.

### Exemplo de uso

```
lucian> /build
Switched to BUILD MODE.

lucian> Crie um servidor Express com rotas para CRUD de usuários

[Tool Call] create_directory
Parameters: { "path": "user-api" }
Result: Directory created: user-api

[Tool Call] create_file
Parameters: { "path": "user-api/package.json", "content": "..." }
Result: File created: user-api/package.json

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
│   └── openrouter.js     # Implementação OpenRouter
├── memory/
│   └── store.js          # Gerenciamento de memória de sessão
└── utils/
    └── logger.js         # Utilitário de logging
```

### Ciclo do agente

```
INPUT → ANALYZE → PLAN → EXECUTE → VERIFY → OUTPUT
```

Cada etapa é explícita e registrada. Em Build Mode, o ciclo inclui chamadas de ferramentas com confirmação.

## Ferramentas disponíveis

O agente possui acesso às seguintes ferramentas em Build Mode:

- `create_file`: Cria novos arquivos
- `edit_file`: Substitui o conteúdo completo de arquivos existentes
- `replace_in_file`: Substitui padrões de texto específicos
- `insert_at_line`: Insere conteúdo em números de linha específicos
- `delete_file`: Remove arquivos
- `create_directory`: Cria diretórios
- `list_files`: Lista conteúdo de diretórios
- `read_file`: Lê o conteúdo de arquivos

## Modelos suportados

Qualquer modelo disponível no OpenRouter pode ser usado. Alguns exemplos:

- `qwen/qwen3.7-plus` (padrão)
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4o`
- `google/gemini-pro-1.5`
- `meta-llama/llama-3.1-405b-instruct`

Use `/switch-model` para alternar entre modelos a qualquer momento.

## Contribuindo

Contribuições são bem-vindas. Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Diretrizes

- Mantenha o código limpo e bem documentado
- Siga o estilo de código existente
- Adicione testes quando aplicável
- Atualize a documentação se necessário

## Roadmap

- [ ] Sistema de plugins
- [ ] Suporte a múltiplos providers (OpenAI, Anthropic, etc)
- [ ] Execução de comandos shell
- [ ] Integração com git
- [ ] Testes automatizados
- [ ] Documentação completa da API

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Agradecimentos

- OpenRouter pela API unificada de modelos
- Comunidade open-source pelas ferramentas e bibliotecas
- Todos os contribuidores que ajudam a melhorar o projeto

---

Feito com foco em simplicidade e utilidade real.
