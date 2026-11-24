// C3 (iii) - Contêineres presos acima da BASE_DA_PILHA (K28)
RETURN 'C3 (iii) 1) trecho original (não retorna nenhuma linha)' AS etapa;
MATCH (base:Container {id:'BASE_DA_PILHA'})-[:EMPILHADO_SOBRE*1..3]->(x:Container) RETURN x.id;
MATCH (base:Container {id:'BASE_DA_PILHA'}) RETURN count(base) AS containers_com_id_BASE_DA_PILHA;

RETURN 'C3 (iii) 2) original só com o id trocado para K28' AS etapa;
MATCH (base:Container {id:'K28'})-[:EMPILHADO_SOBRE*1..3]->(x:Container) RETURN count(x) AS linhas;

RETURN 'C3 (iii) 3) a pilha real, do topo para a base' AS etapa;
MATCH p = (topo:Container)-[:EMPILHADO_SOBRE*]->(base:Container {id:'K28'})
WHERE NOT ()-[:EMPILHADO_SOBRE]->(topo)
RETURN [n IN nodes(p) | n.id] AS pilha;

RETURN 'C3 (iii) 4) correção' AS etapa;
MATCH (base:Container {id:'K28'})<-[:EMPILHADO_SOBRE*1..3]-(x:Container)
RETURN x.id AS container ORDER BY container;
