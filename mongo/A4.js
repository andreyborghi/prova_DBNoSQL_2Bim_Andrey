// A4 - Consulta coberta
// TERMINAL_ALVO = "T4"
db = db.getSiblingDB("logiporto");

// Métricas do explain + JSON completo
function registrar(titulo, exp) {
  const s = exp.executionStats;
  const plano = [];
  for (let e = s.executionStages; e; e = e.inputStage) plano.push(e.stage);
  print(`\n===== ${titulo} =====`);
  printjson({
    indice: exp.queryPlanner.winningPlan.inputStage?.indexName || exp.queryPlanner.winningPlan.inputStage?.inputStage?.indexName,
    stage: plano.join(" <- "),
    totalDocsExamined: s.totalDocsExamined,
    totalKeysExamined: s.totalKeysExamined,
    nReturned: s.nReturned,
    executionTimeMillis: s.executionTimeMillis
  });
  print(EJSON.stringify(exp, null, 2));
}

// Índice que cobre filtro (tipo, terminal) e projeção (container)
if (db.movimentacoes.getIndexes().some(i => i.name === "tipo_1_terminal_1_container_1")) db.movimentacoes.dropIndex("tipo_1_terminal_1_container_1");
print("índice criado: " + db.movimentacoes.createIndex({ tipo: 1, terminal: 1, container: 1 }));

// 1) Projeção { _id: 0, container: 1 } -> consulta coberta
registrar("A4 1) projeção { _id: 0, container: 1 }", db.movimentacoes.find(
  { tipo: "inspecao", terminal: "T4" },
  { _id: 0, container: 1 }
).explain("executionStats"));

// 2) Sem _id: 0 -> o _id volta para o resultado e não está no índice
registrar("A4 2) projeção { container: 1 }", db.movimentacoes.find(
  { tipo: "inspecao", terminal: "T4" },
  { container: 1 }
).explain("executionStats"));
