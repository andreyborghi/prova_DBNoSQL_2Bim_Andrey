# Diário de bordo

## Criar os containers

```bash
docker run -d --name mongo-lab -p 27017:27017 mongo:latest
```

```bash
docker run -d --name neo4j-lab -p 7474:7474 -p 7687:7687 --env NEO4J_AUTH=none neo4j:latest
```

| Questão | Tentativa | como testei | resultado | Decisão |
|---|---|---|---|---|
| Ambiente | Rodar o `logiporto_gerador.js` | `docker exec -i mongo-lab mongosh < mongo/logiporto_gerador.js` | Só apareceu o cabeçalho do mongosh e test> e o arquivo tinha 0 bytes | Preenchi o gerador com o código do enunciado e coloquei o RA |
| A2 | Usar o INCIDENTE na ordem impressa (lat, lon) | consulta com `[lat, lon]` | | |
| A2 | Rodar o $near sem índice | consulta antes do índice | | |
| A3 | O monitor TTL ainda não rodou | `metrics.ttl.passes` antes e depois de 75 s | | |
| A3 | registrado_em não é BSON | $type: "string" x type: "date" | | |