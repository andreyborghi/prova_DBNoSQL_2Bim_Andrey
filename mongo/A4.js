// A4 - Consulta coberta
// TERMINAL_ALVO = "T4"
db = db.getSiblingDB("logiporto");

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

if (db.movimentacoes.getIndexes().some(i => i.name === "tipo_1_terminal_1_container_1")) db.movimentacoes.dropIndex("tipo_1_terminal_1_container_1");
print("índice criado: " + db.movimentacoes.createIndex({ tipo: 1, terminal: 1, container: 1 }));

registrar("A4 1) projeção { _id: 0, container: 1 }", db.movimentacoes.find(
  { tipo: "inspecao", terminal: "T4" },
  { _id: 0, container: 1 }
).explain("executionStats"));

registrar("A4 2) projeção { container: 1 }", db.movimentacoes.find(
  { tipo: "inspecao", terminal: "T4" },
  { container: 1 }
).explain("executionStats"));
