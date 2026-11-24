// B1 - Relatório gerencial
// CLASSE_ALVO = "Refrigerado" | DATA_CORTE = 2026-04-01
db = db.getSiblingDB("logiporto");

const pipeline = [
  { $match: { classe: "Refrigerado", ts: { $gte: ISODate("2026-04-01T00:00:00Z") } } },
  { $group: {
      _id: "$terminal",
      total_movimentacoes: { $sum: 1 },
      peso_total: { $sum: "$peso_kg" },
      peso_medio: { $avg: "$peso_kg" },
      maior_peso: { $max: "$peso_kg" }
  } },
  { $sort: { peso_total: -1 } },
  { $limit: 3 },
  { $project: {
      _id: 0,
      terminal: "$_id",
      total_movimentacoes: "$total_movimentacoes",
      peso_total: "$peso_total",
      peso_medio: { $round: ["$peso_medio", 2] },
      maior_peso: "$maior_peso"
  } }
];


function resumo(titulo, exp) {
  const cursor = exp.stages ? exp.stages[0].$cursor : exp;
  const stats = cursor.executionStats;
  const plano = [];
  for (let s = cursor.queryPlanner.winningPlan.queryPlan || cursor.queryPlanner.winningPlan; s; s = s.inputStage) plano.push(s.stage);
  if (exp.stages) plano.unshift(...exp.stages.slice(1).map(s => Object.keys(s)[0]).reverse());
  let entradaGroup;
  for (let s = stats.executionStages; s; s = s.inputStage) if (s.stage.toLowerCase() === "group") entradaGroup = s.inputStage.nReturned;
  print(`\n===== ${titulo} =====`);
  printjson({
    plano: plano.join(" <- "),
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    documentosQueEntraramNoGroup: entradaGroup,
    gruposGerados: stats.nReturned,
    executionTimeMillis: stats.executionTimeMillis
  });
  print(EJSON.stringify(exp, null, 2));
}

if (db.movimentacoes.getIndexes().some(i => i.name === "classe_1_ts_1_terminal_1_peso_kg_1")) db.movimentacoes.dropIndex("classe_1_ts_1_terminal_1_peso_kg_1");
resumo("B1 antes do índice", db.movimentacoes.explain("executionStats").aggregate(pipeline));

print("\níndice criado: " + db.movimentacoes.createIndex({ classe: 1, ts: 1, terminal: 1, peso_kg: 1 }));
resumo("B1 depois do índice", db.movimentacoes.explain("executionStats").aggregate(pipeline));

print("\n===== B1 resultado =====");
printjson(db.movimentacoes.aggregate(pipeline).toArray());
