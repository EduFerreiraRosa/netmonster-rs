# Perfil .ntm do projeto

Referência consultada em 23/11/2026: https://netmonster.app/docs-user-about-ntm

UTF-8 sem BOM; uma célula/setor por linha; 11 campos separados por ponto e vírgula; sem cabeçalho, comentários, aspas CSV ou ponto e vírgula na descrição. Coordenadas WGS84 em graus decimais, com ponto decimal. Use inteiros decimais para os identificadores. Os arquivos vazios são apenas estrutura inicial.

## Ordem dos campos

```text
2G;MCC;MNC;CID;LAC;XXX;BSIC;Lat;Lon;Location;ARFCN
3G;MCC;MNC;CID;LAC;RNC;PSC;Lat;Lon;Location;UARFCN
4G;MCC;MNC;CI;TAC;eNB;PCI;Lat;Lon;Location;EARFCN
5G;MCC;MNC;NCI;TAC;XXX;PCI;Lat;Lon;Location;ARFCN
```

Campos ignorados XXX ficam vazios. O formato oficial também contempla CDMA, que não faz parte deste perfil inicial. Não coloque metadados extras nas linhas: eles ficam no JSON separado.

## Pontos que exigem cuidado

Na página oficial consultada, a tabela LTE atribui CI a 1–1.048.575 e eNB a 0–255, mas seus próprios exemplos usam CI=13/113 e eNB=141311. Este projeto segue a ordem e o significado dos exemplos: **CI é o identificador local de setor (8 bits), eNB é o identificador de estação (20 bits)**. Não colocar o ECI completo no campo CI.

Para uma identidade LTE convencional de 28 bits, a conversão é:

```text
eNB = ECI // 256
CI  = ECI % 256
ECI = eNB * 256 + CI
```

Isso não significa que todo eNB corresponda a uma torre física única. Não aplique essa divisão a NR: NCI é preservado integralmente; o sexto campo NR é ignorado, não gNB.

A tabela WCDMA da página limita o canal a 1.023, mas seu próprio exemplo usa 10812. O perfil permite UARFCN 0–16.383. Para UMTS, preserve os campos CID/RNC de um export `.ntm` verificado; não copie cegamente o `cid` composto de um JSON. O perfil limita CID a 16 bits e RNC a 1–65.535, sem suporte inicial a variantes estendidas.

A página lista TAC NR até 65.535; redes NR podem fornecer TAC maior. Neste perfil inicial usamos o limite publicado na página para importação conservadora. Um TAC maior exige revisão da compatibilidade com uma versão real do app antes de ampliar a regra. Não truncar, aplicar módulo ou trocar por valor inventado.

O formato oficial documenta 2147483647 como sentinela de desconhecido. O projeto só o aceita nos campos de código rádio e canal, que podem ser desconhecidos. Identidade, área e coordenadas devem estar completas e válidas. Nunca use a sentinela como coordenada, zero como preenchimento ou estimativa como torre confirmada.

## Limites do perfil de publicação

| Tecnologia | Identidade | Área | Campo 6 | Código | Canal |
|---|---|---|---|---|---|
| 2G | CID 1–65534 | LAC 1–65534 | vazio | BSIC 0–1030 | ARFCN 0–1023 |
| 3G | CID 1–65535 | LAC 1–65534 | RNC 1–65535 | PSC 0–511 | UARFCN 0–16383 |
| 4G | CI 0–255 | TAC 1–65534 | eNB 0–1048575 | PCI 0–503 | EARFCN 0–2147483646 |
| 5G | NCI 0–68719476735 | TAC 0–65535 | vazio | PCI 0–1007 | NR-ARFCN 0–2016666 |

MCC deve ser `724`; MNC mantém dois dígitos. A configuração inicial aceita Vivo `06`, Claro `05` e TIM `04`. Isso delimita a base inicial e não é um catálogo de todos os PLMNs dessas empresas. Outro MNC exige evidência e alteração explícita de `config/operadoras.json` em PR.

O validador aplica um retângulo amplo ao redor do RS: latitude -34 a -27 e longitude -58 a -49. É apenas triagem, não limite estadual oficial. A revisão humana deve confirmar município/UF. Cada identidade deve aparecer uma única vez, mesmo que coordenadas ou canal divirjam; resolver o conflito antes de publicar.

Não afirmamos certificação pelo NetMonster. Antes da primeira release com dados, testar a importação em uma versão identificada do app, conferir quantidade de células e localização e registrar o resultado no PR.
