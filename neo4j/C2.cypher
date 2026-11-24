// C2 - Investigação societária e operacional (EMPRESA_SANCIONADA = E22)
// Direção: (a)-[:SOCIA_DE]->(b) = a é sócia de b; a busca parte da sancionada seguindo a seta, até 3 níveis
MATCH (s:Empresa {sancionada: true})-[:SOCIA_DE*1..3]->(e:Empresa)
WHERE e <> s
MATCH (e)<-[:PERTENCE_A]-(k:Container)-[p:PASSOU_POR]->(t:Terminal)<-[ps:PASSOU_POR]-(:Container)-[:PERTENCE_A]->(s)
WHERE p.data = ps.data
RETURN DISTINCT e.nome AS empresa, k.id AS container, t.nome AS terminal, p.data AS data
ORDER BY empresa, container, data;

// Conferência: empresas alcançadas a partir da sancionada e o nível mais curto de cada uma
MATCH caminho = (s:Empresa {sancionada: true})-[:SOCIA_DE*1..3]->(e:Empresa)
WHERE e <> s
RETURN e.nome AS empresa, min(length(caminho)) AS nivel
ORDER BY nivel, empresa;

// Conferência: contêiner da sancionada que estava no mesmo terminal e data
MATCH (s:Empresa {sancionada: true})<-[:PERTENCE_A]-(k:Container)-[p:PASSOU_POR]->(t:Terminal)
RETURN k.id AS container_sancionada, t.nome AS terminal, p.data AS data
ORDER BY data;
