# Pré-registro de previsões

| | |
|---|---|
| **Disciplina** | Banco de Dados NoSQL - Engenharia de Software |
| **Professor** | Leonardo Rocha |
| **Aluno** | Andrey Araújo Borghi |
| **Data** 23|11|2026

---

## Para A1: 

| | Estágio esperado | totalDocsExamined | totalKeysExamined | SORT na memória | Returned |
|---|---|---|---|---|---|
| a) sem índice inicialmente | COLLSCAN | 400.000 | 0 | sim | 20 |
| b) `{ terminal, classe, ts, peso_kg: -1 }` | SORT + FETCH + IXSCAN | aprox 20 ou 30 | 400.000 x 1/5 x 1/4 x (dias apos DATA_CORTE divide por 300), entao entre 8 e 14 mil | sim | 20 |
| c) ESR `{ terminal, classe, peso_kg: -1, ts }` | LIMIT - FETCH - IXSCAN | 20 | dezenas | nao | 20 |

## Para A2:

| | Previsão |
|---|---|
| Antes do índice | erro: sem índice geo-espacial|
| Coordenadas na ordem do Google Maps latidude e long | 0 documentos (GeoJSON é `[lon, lat]`) |
| Com índice 2dsphere | LIMIT - GEO_NEAR_2DSPHERE (IXSCAN por distancia) |
| totalDocsExamined / totalKeysExamined | muito |
| SORT em memória | não pq o estágio geo já devolve por distância |
| nReturned | 10 |

## Para A3:

Hipótese inicial: `registrado_em` foi gravado como String e nao como BSON e o monitor TTL remove documentos em que o campo indexado é date, então o indice existe mas nunca encontra o que precisa expirar

## Para A4:

| | Estágio esperado | totalDocsExamined | totalKeysExamined | SORT | nReturned |
|---|---|---|---|---|---|
| `{ id: 0, container: 1 }` | PROJECTION_COVERED - IXSCAN | 0 | aprox 16.000 (400.000 x 1/5 x 1/5) | não | aproximadamente 16.000 |
| `{ container: 1 }` ou `{ container: 0}`  | PROJECTION_SIMPLE - FETCH - IXSCAN | aprox 16.000 | 16.000 | não | 16.000 |

## Para B1:

| | Estágio esperado | totalDocsExamined | totalKeysExamined | SORT em memória | Docs no $group | Returned |
|---|---|---|---|---|---|---|
| Sem índice | GROUP - COLLSCAN | 400.000 | 0 | so dos 5 grupos | 400.000 x 1/4 x (dias após DATA_CORTE divide 300), entre 40 e 70 mil | 3 |
| `{ classe: 0 ou 1 (inicial), ts: 1 }` | GROUP - FETCH - IXSCAN | igual aos docs no `$group` | igual aos docs no `$group` | só dos 5 grupos | igual | 3 |

## Para B2:

| | Estágio esperado | totalDocsExamined | totalKeysExamined | SORT na memória | nReturned |
|---|---|---|---|---|---|
| Original | GROUP - COLLSCAN | 400.000 | 0 | sim | 0 a 3 ou 4 documentos, kg_total: -1 ou sem nada |
| Corrigido | GROUP - FETCH - IXSCAN | aprox 100.000 (400.000 x 1/4) | 100.000 | só dos 5 grupos | 3 |

## Para C2:

Direção: saída, (sancionada)-[:SOCIA_DE]->(empresa) a aresta vai de quem tem participação para a empresa participada; a rede da sancionada sao as empresas em que ela participa.

Ordem de grandeza: unidades (0 a 10)