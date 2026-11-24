// C3 (ii) - Empresas ligadas à sancionada
RETURN 'C3 (ii) 1) trecho original com LIMIT 20' AS etapa;
MATCH (s:Empresa {sancionada:true})-[:SOCIA_DE*]-(x:Empresa) RETURN x.nome LIMIT 20;

RETURN 'C3 (ii) 2) crescimento dos caminhos sem direção' AS etapa;
MATCH p = (s:Empresa {sancionada:true})-[:SOCIA_DE*1..2]-(x:Empresa) RETURN '1..2' AS profundidade, count(p) AS caminhos, count(DISTINCT x) AS empresas_distintas;
MATCH p = (s:Empresa {sancionada:true})-[:SOCIA_DE*1..4]-(x:Empresa) RETURN '1..4' AS profundidade, count(p) AS caminhos, count(DISTINCT x) AS empresas_distintas;
MATCH p = (s:Empresa {sancionada:true})-[:SOCIA_DE*1..6]-(x:Empresa) RETURN '1..6' AS profundidade, count(p) AS caminhos, count(DISTINCT x) AS empresas_distintas;
MATCH p = (s:Empresa {sancionada:true})-[:SOCIA_DE*1..8]-(x:Empresa) RETURN '1..8' AS profundidade, count(p) AS caminhos, count(DISTINCT x) AS empresas_distintas;
MATCH p = (s:Empresa {sancionada:true})-[:SOCIA_DE*1..10]-(x:Empresa) RETURN '1..10' AS profundidade, count(p) AS caminhos, count(DISTINCT x) AS empresas_distintas;
MATCH (e:Empresa) RETURN count(e) AS total_empresas_no_banco;

RETURN 'C3 (ii) 3) correção' AS etapa;
MATCH (s:Empresa {sancionada:true})-[:SOCIA_DE*1..3]->(x:Empresa)
WHERE x <> s
RETURN DISTINCT x.nome AS empresa ORDER BY empresa;
