# netmonster-rs

Base comunitária brasileira de células para o NetMonster, inicialmente focada no Rio Grande do Sul e nas redes Vivo, Claro e TIM. Projeto independente, sem vínculo oficial com o aplicativo ou as operadoras.

## Situação inicial

**0 células publicadas.** Os arquivos `.ntm` estão vazios por decisão de qualidade e privacidade; ainda não são bases úteis para importação. Não contêm cabeçalhos, comentários nem pontos fictícios.

O histórico fornecido menciona marcações manuais, mas não permite associar com segurança cada coordenada exportada a uma ERB confirmada. Não publicamos posições de recepção, trajetos ou estimativas como se fossem torres. Veja [a auditoria inicial](docs/DADOS-INICIAIS.md).

## Organização

```text
databases/
  vivo/vivo-rs.ntm
  claro/claro-rs.ntm
  tim/tim-rs.ntm
metadata/registros.json       # evidências e procedência, fora do .ntm
docs/                        # formato, privacidade e publicação
scripts/validate.mjs          # validação sem dependências externas
tests/validate.test.mjs
.github/ISSUE_TEMPLATE/       # inclusão/correção e discussão
.github/workflows/validate.yml
```

Cada linha representa uma célula/setor, não necessariamente uma torre física distinta. Uma torre pode abrigar várias células e operadoras. O escopo inicial é RS; outras UFs exigem expansão explícita das regras e diretórios.

## Usar no NetMonster

Quando houver células revisadas, abra o arquivo da operadora no GitHub e baixe o conteúdo pelo botão **Raw / Download raw file**, preservando a extensão `.ntm`. No NetMonster, abra o menu de banco de dados (**Database / Banco de dados**), escolha **Import / Importar** e selecione o arquivo. Os nomes podem variar por versão. Revise as opções antes de substituir bases importadas e mantenha seu backup local.

Começamos pela importação manual. Publicar no GitHub não ativa compartilhamento ou atualizações no aplicativo. Uma integração futura depende de contato e aprovação do NetMonster: [publicação oficial de bancos](https://netmonster.app/docs-owner-publish).

## Contribuir

Abra uma Issue usando o modelo **Incluir ou corrigir célula**, ou envie um Pull Request com a linha `.ntm` e a procedência correspondente em `metadata/registros.json`. Uma Issue é proposta para revisão, não inclusão automática. Leia [CONTRIBUTING.md](CONTRIBUTING.md) e [as regras de privacidade](docs/PRIVACIDADE.md) antes de anexar qualquer arquivo.

Só aceitamos coordenadas da infraestrutura com associação comprovada à célula. Não envie exportações brutas, GPS do telefone, trilhas, números pessoais, IMSI/IMEI, contatos, fotos com pessoas ou metadados de localização do fotógrafo.

## Validar localmente

Instale Node.js 22 ou superior e execute na pasta do projeto:

```sh
node --test tests/validate.test.mjs
node scripts/validate.mjs
```

A mesma validação roda em pushes e Pull Requests no GitHub Actions. Uma aprovação automática verifica estrutura e consistência; a confirmação da torre e a revisão de privacidade são humanas.

## Formato e licenças

O perfil usa 11 campos separados por `;`, conforme os esquemas e exemplos da [documentação oficial `.ntm`](https://netmonster.app/docs-user-about-ntm). Leia [FORMATO-NTM.md](docs/FORMATO-NTM.md) para as divergências encontradas na tabela oficial e as restrições deste projeto. Não foi realizado teste de importação no aplicativo nesta versão inicial.

Dados, metadados e documentação: **CC BY 4.0**. Scripts, testes e configurações: **MIT**. Consulte [LICENSE](LICENSE), [LICENSE-CODE](LICENSE-CODE) e [ATTRIBUTION.md](ATTRIBUTION.md). Só contribua com material próprio ou que você tenha autorização para redistribuir nesses termos.
