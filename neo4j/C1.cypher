// C1 - Modelagem: conferência do modelo carregado e subgrafo real da EMPRESA_SANCIONADA (E22)
RETURN 'C1 1) nós por rótulo' AS etapa;
MATCH (n) RETURN labels(n)[0] AS rotulo, count(*) AS nos ORDER BY rotulo;

RETURN 'C1 2) propriedades dos nós' AS etapa;
MATCH (n) UNWIND keys(n) AS propriedade RETURN DISTINCT labels(n)[0] AS rotulo, propriedade ORDER BY rotulo, propriedade;

RETURN 'C1 3) relacionamentos: direção, propriedades e total' AS etapa;
MATCH (a)-[r]->(b)
RETURN labels(a)[0] AS de, type(r) AS relacionamento, labels(b)[0] AS para, keys(r) AS propriedades, count(*) AS total
ORDER BY relacionamento;

RETURN 'C1 4) subgrafo real: E22 e seus sócios diretos' AS etapa;
MATCH (a:Empresa)-[r:SOCIA_DE]->(b:Empresa)
WHERE a.sancionada OR b.sancionada
RETURN a.cnpj AS de, a.nome AS nome_de, b.cnpj AS para, b.nome AS nome_para, r.pct AS pct
ORDER BY de;
