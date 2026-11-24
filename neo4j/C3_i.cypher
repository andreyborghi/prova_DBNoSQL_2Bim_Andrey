// C3 (i) - Registrar que E1 é sócia de E2
RETURN 'C3 (i) 1) antes' AS etapa;
MATCH (e:Empresa) WHERE e.cnpj IN ['E1', 'E2'] RETURN e.cnpj AS cnpj, count(*) AS nos, collect(e.nome) AS nomes ORDER BY cnpj;
OPTIONAL MATCH (:Empresa {cnpj:'E1'})-[r:SOCIA_DE]->(:Empresa {cnpj:'E2'}) RETURN count(r) AS arestas_E1_E2;

RETURN 'C3 (i) 2) trecho original' AS etapa;
CREATE (a:Empresa {cnpj:'E1'})-[:SOCIA_DE {pct:30}]->(b:Empresa {cnpj:'E2'});

RETURN 'C3 (i) 3) depois do trecho original' AS etapa;
MATCH (e:Empresa) WHERE e.cnpj IN ['E1', 'E2'] RETURN e.cnpj AS cnpj, count(*) AS nos, collect(e.nome) AS nomes ORDER BY cnpj;
MATCH (a:Empresa {cnpj:'E1'})-[r:SOCIA_DE]->(b:Empresa {cnpj:'E2'}) RETURN a.nome AS de, r.pct AS pct, b.nome AS para;
MATCH (e:Empresa) RETURN count(e) AS total_empresas;

RETURN 'C3 (i) 4) limpeza dos duplicados' AS etapa;
MATCH (e:Empresa) WHERE e.cnpj IN ['E1', 'E2'] AND e.nome IS NULL DETACH DELETE e RETURN count(e) AS removidos;

RETURN 'C3 (i) 5) correção' AS etapa;
MATCH (a:Empresa {cnpj:'E1'}), (b:Empresa {cnpj:'E2'})
MERGE (a)-[r:SOCIA_DE]->(b)
SET r.pct = 30
RETURN a.nome AS de, r.pct AS pct, b.nome AS para;
CREATE CONSTRAINT empresa_cnpj_unico IF NOT EXISTS FOR (e:Empresa) REQUIRE e.cnpj IS UNIQUE;

RETURN 'C3 (i) 6) depois da correção' AS etapa;
MATCH (e:Empresa) WHERE e.cnpj IN ['E1', 'E2'] RETURN e.cnpj AS cnpj, count(*) AS nos, collect(e.nome) AS nomes ORDER BY cnpj;
MATCH (a:Empresa {cnpj:'E1'})-[r:SOCIA_DE]->(b:Empresa {cnpj:'E2'}) RETURN a.nome AS de, r.pct AS pct, b.nome AS para;
MATCH (e:Empresa) RETURN count(e) AS total_empresas;
SHOW CONSTRAINTS YIELD name, labelsOrTypes, properties, type;
