# Contribuindo com o Lucian Code

Obrigado pelo interesse em contribuir. Este documento explica como participar do projeto, seja reportando problemas, sugerindo melhorias ou enviando código.

## Antes de começar

Leia o README.md para entender o que o projeto faz e como ele funciona. Familiarize-se com a estrutura e os modos de operação antes de propor mudanças significativas.

## Formas de contribuir

Você não precisa escrever código para ajudar. Todas as formas abaixo são valiosas:

- Reportar bugs com informações detalhadas
- Sugerir novas funcionalidades ou ferramentas
- Melhorar a documentação
- Revisar pull requests de outros contribuidores
- Testar o projeto em diferentes sistemas operacionais
- Compartilhar o projeto com outros desenvolvedores

## Reportando bugs

Abra uma issue em https://github.com/arthursaert/lucian-code/issues com o template de bug report. Inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado versus comportamento atual
- Sistema operacional e versão
- Modelo utilizado (se aplicável)
- Logs relevantes (remova informações sensíveis como chaves de API)

## Sugerindo funcionalidades

Abra uma issue com o template de feature request. Explique:

- O problema que a funcionalidade resolve
- Como você imagina a solução
- Casos de uso práticos

Discussões são bem-vindas antes de implementar. Nem toda ideia será aceita, e tudo bem.

## Configurando o ambiente

```bash
git clone https://github.com/arthursaert/lucian-code.git
cd lucian-code
npm install
```

Crie um arquivo `.env` com sua chave do OpenRouter:

```env
OPENROUTER_API_KEY=sua_chave_aqui
```

Execute com:

```bash
npm start
```

Para compilar localmente, você precisa do Bun instalado:

```bash
curl -fsSL https://bun.sh/install | bash
npm run build:linux
```

## Estrutura do projeto

```
src/
├── index.js              # Ponto de entrada e loop REPL
├── cli/
│   ├── commands.js       # Parser e roteador de comandos
│   └── ui.js             # Renderização da interface
├── agent/
│   ├── core.js           # Loop principal do agente
│   ├── modes.js          # Prompts e lógica de modos
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

Entenda essa estrutura antes de modificar código. Cada diretório tem responsabilidade clara.

## Padrões de código

### Estilo geral

- JavaScript moderno (ES Modules)
- Node.js 18 ou superior
- Sem dependências externas desnecessárias
- Código limpo e autoexplicativo
- Comentários apenas quando o "porquê" não é óbvio

### Regras específicas

- **Sem emojis** em nenhum output do sistema, logs ou documentação técnica
- **Sem linguagem infantil** ou informalidade excessiva
- **Tom profissional** mas acessível
- Funções pequenas com responsabilidade única
- Nomes descritivos (evite `data`, `temp`, `x`)
- Tratamento explícito de erros

### Adicionando uma nova ferramenta

Edite `src/agent/tools.js`:

1. Adicione a definição em `TOOL_DEFINITIONS` seguindo o formato OpenAI function calling
2. Implemente o método correspondente na classe `ToolExecutor`
3. Adicione o case no método `execute`
4. Teste em BUILD MODE

Exemplo mínimo:

```javascript
{
  type: 'function',
  function: {
    name: 'minha_tool',
    description: 'Descrição clara do que a tool faz',
    parameters: {
      type: 'object',
      properties: {
        parametro: {
          type: 'string',
          description: 'O que este parâmetro faz'
        }
      },
      required: ['parametro']
    }
  }
}
```

### Adicionando um novo provider

1. Crie `src/providers/meu_provider.js` estendendo `BaseProvider`
2. Implemente o método `complete(messages, tools)`
3. Trate erros de forma consistente com `ModelNotFoundError`
4. Integre no `src/index.js`

O sistema é agnóstico em relação ao provider. Qualquer API compatível com o formato de chat completions pode ser integrada.

## Fluxo de trabalho

1. Crie uma branch para sua contribuição:

```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/descricao-do-bug
```

2. Faça commits atômicos e bem descritos:

```bash
git commit -m "Add tool for searching files by content"
git commit -m "Fix error handling in OpenRouter provider"
```

3. Mantenha sua branch atualizada com a main:

```bash
git fetch origin
git rebase origin/main
```

4. Envie e abra um pull request:

```bash
git push origin feature/nome-da-feature
```

## Abrindo um pull request

Antes de abrir o PR:

- Teste suas alterações localmente
- Verifique se não quebrou funcionalidades existentes
- Atualize a documentação se necessário
- Certifique-se de que o código segue os padrões acima

Na descrição do PR, explique:

- O que foi mudado e por quê
- Como testar as mudanças
- Screenshots ou logs se relevante

Pull requests pequenos e focados são revisados mais rápido. Evite mudanças gigantes em um único PR.

## O que não será aceito

- Código com emojis no output do sistema
- Dependências desnecessárias
- Mudanças cosméticas sem propósito claro
- Código que quebra funcionalidades existentes sem justificativa
- Implementações que ignoram a arquitetura modular do projeto

Isso não significa que ideias diferentes são proibidas. Significa que mudanças precisam de justificativa técnica.

## Código de conduta

Este projeto adota o Contributor Covenant. Em resumo:

- Seja respeitoso em todas as interações
- Critique ideias, não pessoas
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade

Comportamento abusivo, ofensivo ou prejudicial não será tolerado.

## Dúvidas

Se tiver dúvidas sobre como contribuir, abra uma issue marcada como "question" ou entre em contato com o mantenedor. Não existe pergunta boba.

## Reconhecimento

Todos os contribuidores são listados na página do projeto. Contribuições significativas podem ser destacadas nas notas de release.

Obrigado por ajudar a construir o Lucian Code.
