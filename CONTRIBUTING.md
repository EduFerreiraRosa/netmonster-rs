# Como contribuir

## Pela Issue

1. Pesquise Issues existentes para evitar duplicação.
2. Use o modelo de inclusão/correção. Informe operadora, PLMN observado, tecnologia, identificadores, município/UF e coordenadas **da ERB**.
3. Explique como a posição e a associação da célula foram confirmadas: marcação manual de torre identificada ou fonte explicitamente vinculada à estação. Uma marcação manual sem esse vínculo não basta.
4. Forneça evidência pública sanitizada e sua licença. Não copie dados de CellMapper, mapas comerciais, outras bases ou fotografias sem verificar os direitos de reutilização.
5. Declare que a contribuição não contém coordenadas de usuário e pode ser publicada sob CC BY 4.0.

O mantenedor pode pedir esclarecimento. Após confirmar a evidência, transforma a proposta em um PR. As informações da Issue são públicas: revise antes de enviar.

## Pelo Pull Request

1. Faça um fork e crie uma branch, por exemplo `dados/municipio-operadora`.
2. Edite apenas a base da operadora correspondente. Use valores decimais reais; não invente células, setores ou bandas a partir de uma torre próxima.
3. Para cada linha adicionada ou alterada, inclua/atualize um objeto em `metadata/registros.json`. O campo `linha` deve reproduzir a linha `.ntm` literalmente.
4. Preencha os campos abaixo, execute testes e validador e use o checklist do PR.
5. Aguarde revisão humana. Não sobrescreva coordenadas divergentes sem explicar a mudança e suas evidências.

Modelo de metadados (é um esquema de preenchimento, não um registro real):

```json
{
  "arquivo": "databases/tim/tim-rs.ntm",
  "linha": "COPIAR A LINHA NTM COMPLETA",
  "uf": "RS",
  "municipio": "PREENCHER",
  "metodo": "marcacao_manual_erb",
  "evidencia": "URL pública sanitizada ou descrição verificável da torre e do vínculo com a célula",
  "referencia": "Issue #N ou caminho de documento público sanitizado no repositório",
  "data_verificacao": "AAAA-MM-DD",
  "atribuicao": "Pseudônimo público escolhido pelo autor",
  "licenca": "CC-BY-4.0",
  "coordenadas_da_erb": true,
  "sem_dados_pessoais": true
}
```

O outro método permitido é `fonte_explicita_torre`. A fonte deve permitir redistribuição sob CC BY 4.0; acesso público, sozinho, não é autorização. Registre atribuições e licenças adicionais necessárias na evidência e em ATTRIBUTION.md. Conteúdo incompatível deve ficar fora da base.

## Critérios do mantenedor

- Confirmar infraestrutura no município/RS e o vínculo entre identificadores e torre; coordenadas dentro de uma região não comprovam isso.
- Verificar PLMN observado e associação atual à operadora. Não converter MNC com base no nome comercial do chip ou roaming.
- Conferir a decomposição LTE e os valores NR. Um ícone 5G NSA não fornece um NCI; não fabricar um registro NR.
- Verificar coordenadas, duplicações, conflitos, descrições e permissões de reutilização.
- Conferir evidência e privacidade antes de mesclar. Pendências permanecem em discussão, fora dos `.ntm`.
- Registrar correções no PR e atualizar a procedência. Só depois publicar arquivos ou uma release.

Sem confirmação suficiente, não incluir. Não usar posição de recepção, estimativa automática, centro do município ou localização residencial como substituto da torre. Scripts não conseguem decidir se uma coordenada pertence à pessoa ou à ERB.
