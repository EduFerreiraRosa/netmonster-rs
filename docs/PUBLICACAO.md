# Publicar no GitHub

Repositório público: https://github.com/EduFerreiraRosa/netmonster-rs

O repositório foi criado para publicar esta estrutura inicial. As instruções de criação abaixo servem para uma cópia independente; para contribuir com a base existente, siga CONTRIBUTING.md.

## Pela interface

1. Entre na sua conta GitHub e abra **New repository**.
2. Escolha o nome provisório `netmonster-rs`, visibilidade **Public** e ative Issues. Não gere README ou licença automática para evitar conflito com estes arquivos.
3. Publique o conteúdo desta pasta, incluindo `.github`. A forma mais confiável para preservar diretórios ocultos e arquivos vazios é Git/GitHub Desktop.

## Com Git e GitHub CLI autenticados

Na pasta deste projeto, os comandos abaixo criam um repositório novo e enviam o conteúdo. Execute apenas se `netmonster-rs` ainda não existir na sua conta. Se já existir, confira seu conteúdo e destino antes de configurar qualquer envio.

```sh
git init -b main
git add .
git commit -m "Estrutura inicial da base comunitária NetMonster RS"
gh repo create netmonster-rs --public --source=. --remote=origin --push --description "Base comunitária brasileira de células NetMonster, inicialmente no Rio Grande do Sul"
```

Sem GitHub CLI, crie o repositório na interface e use a URL fornecida pelo GitHub ao configurar o remoto. Não coloque senhas ou tokens em arquivos ou comandos versionados.

## Após publicar

- Confirme os três `.ntm`, os modelos de Issues/PR e o workflow **Validar base**.
- Confirme que o Actions executou com sucesso. O workflow precisa de permissões apenas de leitura.
- Quando a conta permitir, proteja `main` exigindo o check **validar** e revisão de PR antes da mesclagem. Essa configuração é feita no GitHub; o arquivo de workflow sozinho não a ativa.
- Crie releases datadas somente quando houver dados revisados. Anexe os `.ntm`, atribuição e aviso de licença. O pacote inicial vazio não deve ser anunciado como cobertura disponível.
- Teste a importação no app antes da primeira release de dados; registre versão do app, contagem e conferência dos pontos.

## Integração futura

Segundo https://netmonster.app/docs-owner-publish, mantenedores devem hospedar e atualizar a base e contatar o NetMonster informando cobertura e endereço. Atualizações no aplicativo dependem dessa integração. GitHub não a cria automaticamente.

A recepção direta de contribuições descrita em https://netmonster.app/docs-owner-receive exige um endpoint próprio e integração separada. Não há endpoint, coleta automática ou envio de mensagens ao desenvolvedor neste projeto inicial.
