// C3 (iv) - Contêineres perigosos DISTINTOS por terminal
RETURN 'C3 (iv) 1) trecho original' AS etapa;
MATCH (k:Container)-[:PASSOU_POR]->(t:Terminal) WHERE k.classe = 'Perigoso' RETURN t.nome, count(k);

RETURN 'C3 (iv) 2) correção' AS etapa;
MATCH (k:Container)-[:PASSOU_POR]->(t:Terminal) WHERE k.classe = 'Perigoso'
RETURN t.nome AS terminal, count(DISTINCT k) AS perigosos_distintos ORDER BY terminal;

RETURN 'C3 (iv) 3) perigosos que passaram 2 vezes pelo mesmo terminal' AS etapa;
MATCH (k:Container {classe:'Perigoso'})-[p:PASSOU_POR]->(t:Terminal)
WITH k, t, count(p) AS passagens, collect(p.data) AS datas
WHERE passagens > 1
RETURN k.id AS container, t.nome AS terminal, passagens, datas ORDER BY container;

RETURN 'C3 (iv) 4) total de contêineres perigosos' AS etapa;
MATCH (k:Container {classe:'Perigoso'}) RETURN count(k) AS perigosos;
