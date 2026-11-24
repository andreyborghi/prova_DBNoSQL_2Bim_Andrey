# Prova DBNoSQL 2 Bimestre

| | |
|---|---|
| **Disciplina** | Banco de Dados NoSQL - Engenharia de Software |
| **Professor** | Leonardo Rocha |
| **Aluno** | Andrey Araújo Borghi |
| **RA** | 26006549-2 |

## Parâmetros da prova

| Parâmetro | Valor |
|---|---|
| CLASSE_ALVO | Refrigerado |
| TERMINAL_ALVO | T4 |
| DATA_CORTE | 2026-04-01 |
| INCIDENTE | -25.4580 -48.4730 |
| EMPRESA_SANCIONADA | E22 |
| BASE_DA_PILHA | K28 |
| **Código de Autenticidade** | LP-260065492-20049-80461 |


# Parte A — Auditoria e Indexação no MongoDB (30 pontos)

## A1. Painel do pátio (10 pontos)

### a) Sem nenhum índice criado, rode .explain("executionStats") e registre stage, totalDocsExamined, totalKeysExamined, nReturned e executionTimeMillis.

- plano: 'SORT <- COLLSCAN',
- totalDocsExamined: 400000,
- totalKeysExamined: 0,
- nReturned: 20,
- executionTimeMillis: 1398

### b) Crie o índice "na ordem do filtro" { terminal: 1, classe: 1, ts: 1, peso_kg: -1 } e registre as mesmas métricas.

```javascript
db.movimentacoes.createIndex({ terminal: 1, classe: 1, ts: 1, peso_kg: -1 })
```

- plano: 'FETCH <- SORT <- IXSCAN',
- totalDocsExamined: 20,
- totalKeysExamined: 14079,
- nReturned: 20,
- executionTimeMillis: 19


### c) Remova o índice anterior e crie o índice projetado pela regra ESR. Registre as métricas novamente.

```javascript
db.movimentacoes.dropIndex({ terminal: 1, classe: 1, ts: 1, peso_kg: -1 })
db.movimentacoes.createIndex({ terminal: 1, classe: 1, peso_kg: -1, ts: 1 })
```

-  plano: 'LIMIT <- FETCH <- IXSCAN',
- totalDocsExamined: 20,
- totalKeysExamined: 30,
- nReturned: 20,
- executionTimeMillis: 3


### d) Monte uma tabela comparando a), b) e c) e explique a diferença entre b) e c) com base no funcionamento da B-Tree e do mecanismo de ordenação.

| Métrica | a) sem índice | b) ordem do filtro | c) ESR |
|---|---|---|---|
| Stage | SORT ← COLLSCAN | FETCH ← SORT ← IXSCAN | LIMIT ← FETCH ← IXSCAN |
| totalDocsExamined | 400000 | 20 | 20 |
| totalKeysExamined | 0 | 14079 | 30 |
| nReturned | 20 | 20 | 20 |
| executionTimeMillis | 1398 | 19 | 3 |
| SORT em memória | sim | sim | não |

**B-Tree.** O índice composto ordena as chaves campo a campo, na ordem declarada, ai cada campo só fica ordenado entre chaves que têm os campos anteriores iguais

**b) `{ terminal, classe, ts, peso_kg }`.** Dentro de T4 + Refrigerado, as chaves estão ordenadas por ts, que é praticamente único. Por isso o `peso_kg` fica fora de ordem. O IXSCAN precisa ler todas chaves do range, e um SORT bloqueante em memória escolhe os 20 mais pesados. Como `peso_kg` está na chave, o FETCH busca só os 20 documentos finais.

**c) `{ terminal, classe, peso_kg: -1, ts }`.** Dentro de T4 + Refrigerado, as chaves já estão em ordem decrescente de peso, então não há SORT. O `ts` é filtrado na própria chave (10 chaves descartadas) e o LIMIT para a varredura no 20 resultado. Resultado: 30 chaves em vez de + de14mil e 3 ms em vez de 19 ms.

## A2. Incidente no pátio (7 pontos)

O Google Maps entrega as coordenadas como `lat, lon` (`-25.4580, -48.4730`). O GeoJSON exige `[longitude, latitude]`, então o ponto do incidente é `[-48.4730, -25.4580]`.

```javascript
db.movimentacoes.find({
  posicao: {
    $near: {
      $geometry: { type: "Point", coordinates: [-48.4730, -25.4580] },
      $maxDistance: 300
    }
  }
}).limit(10)
```

### 1) Antes do índice

`ERRO: error enumerating plans for query: ns=logiporto.movimentacoes limit=10Tree: GEONEAR  field=posicao maxdist=300 isNearSphere=0
Sort: {}
Proj: {}
 planner returned error :: caused by :: unable to find index for $geoNear query`

O `$near` precisa de um índice geoespacial e sem ele, o MongoDB não consegue devolver os documentos ordenados por distância e recusa a consulta.

### 2) Indice criado

```javascript
db.movimentacoes.createIndex({ posicao: "2dsphere" })
```

O índice certo é o `2dsphere`, porque `posicao` é um GeoJSON point e a distância é calculada em metros sobre a Terra.

### 3) Latidude/long

documentos retornados: 0

Com as coordenadas na ordem do Google Maps, `[-25.4580, -48.4730]`, a consulta retorna 0 documentos e não dá errO MongoDB lê esse par como longitude -25.458 e latitude -48.473, que é um ponto válido.

### 4) Resultado (ordenado por proximidade)

| # | container | tipo | terminal | distância |
|---|---|---|---|---|
| 1 | CTN02024 | gate_out | T5 | 3,0 m |
| 2 | CTN03171 | inspecao | T4 | 5,2 m |
| 3 | CTN30557 | gate_in | T3 | 6,8 m |
| 4 | CTN01448 | inspecao | T4 | 7,0 m |
| 5 | CTN37504 | descarga | T3 | 9,0 m |
| 6 | CTN34945 | gate_in | T5 | 10,5 m |
| 7 | CTN01307 | carga | T3 | 12,2 m |
| 8 | CTN54381 | descarga | T5 | 12,3 m |
| 9 | CTN42498 | carga | T3 | 12,7 m |
| 10 | CTN33713 | descarga | T2 | 14,7 m |

### 5) explain("executionStats")

- Stage: LIMIT <- GEO_NEAR_2DSPHERE <- (2x FETCH <- IXSCAN)
- totalDocsExamined: 89
- totalKeysExamined: 125
- nReturned: 10
- executionTimeMillis: 7

### Etapas do plano

- **posicao_2dsphere:** o 2dsphere guarda cada ponto como células S2, uma grade que divide a esfera. Em cada anel de busca, o IXSCAN lê só as chaves das células que cobrem aquele anel: 28 chaves no 1 anel e 97 no 2.
- **FETCH:** as células são aproximadas, então é preciso carregar o documento para ter o ponto exato, foram 12 documentos no 1 anel e 77 no 2, total 89.
- **GEO_NEAR_2DSPHERE:** busca em aneis crescentes a partir do incidente, O anel de 0 a 13,3 m entregou 9 documentos e o de 13,3 a 39,9 m entregou o decimo. Em cada anel ele calcula a distância exata, descarta o que está fora e entrega em ordem crescente de distância. É daí que vem o "já ordenado por proximidade", sem estágio SORT. No 2 anel faltava só 1 resultado, mas ele precisou examinar os 77 candidatos para garantir que entregava o mais próximo.
- **LIMIT:** encerra a busca no 10º resultado. Por isso, mesmo com raio de 300 m, a busca não passou de 40 m.

## A3. O TTL que não apaga (6 pontos)

### Motivo

O campo `registrado_em` foi gravado como string, e não como Date do BSON; O índice TTL existe, mas só apaga documentos cujo campo indexado é do tipo Date.

### Comprovação

```javascript
db.alertas.aggregate([
  { $group: { _id: { $type: "$registrado_em" }, total: { $sum: 1 } } }
])
```

Os 100000 alertas têm registrado_em como string. Destes, + de 99000 já passaram dos 30 dias e continuam no banco.


Script: [mongo/A3.js](mongo/A3.js) | Saída: [mongo/A3_saida.txt](mongo/A3_saida.txt)

### Causa raiz

O TTL monitor é uma thread do mongod que roda a cada 60 segundos para cada índice TTL, ele apaga os documentos cujo valor indexado é uma Date e eele busca no índice so a faixa de chaves do tipo Date, como o MongoDB ordena as chaves primeiro pelo tipo BSON, as chaves strings ficam em outra faixa da b-tree e nunca entram nessa busca

### Comando de índice correto

```javascript
db.alertas.createIndex(
  { registrado_em: 1 },
  { expireAfterSeconds: 2592000 }   // 30 dias = 30x24x60x60
)
```

### Como deve gravar os novos alertas

registrado_em deve ser gravado como Date (BSON), e nunca como texto:

```javascript
db.alertas.insertOne({ sensor: "S1", nivel: "critico", registrado_em: new Date().toISOString() })

db.alertas.insertOne({ sensor: "S1", nivel: "critico", registrado_em: new Date() })
```

