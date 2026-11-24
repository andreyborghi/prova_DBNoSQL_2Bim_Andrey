// Parâmetros gerados pelo logiporto_gerador.js (RA 260065492)
const CLASSE_ALVO = "Refrigerado";
const TERMINAL_ALVO = "T4";
const DATA_CORTE = new Date("2026-04-01T00:00:00Z");
const INCIDENTE = "-25.4580, -48.4730"; // formato Google Maps: "lat, lon"

db = db.getSiblingDB("logiporto");

// Plano vencedor + métricas do explain("executionStats"), seguido do JSON completo
function resumo(titulo, exp) {
  const cursor = exp.stages ? exp.stages[0].$cursor : exp;
  const stats = cursor.executionStats;
  const plano = [];
  for (let s = cursor.queryPlanner.winningPlan.queryPlan || cursor.queryPlanner.winningPlan; s; s = s.inputStage) {
    plano.push(s.inputStages ? s.stage + "[" + s.inputStages.map(i => i.stage).join(", ") + "]" : s.stage);
  }
  if (exp.stages) plano.unshift(exp.stages.slice(1).map(s => Object.keys(s)[0]).reverse().join(" <- "));
  print(`\n===== ${titulo} =====`);
  printjson({
    plano: plano.filter(Boolean).join(" <- "),
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    nReturned: stats.nReturned,
    executionTimeMillis: stats.executionTimeMillis
  });
  print(EJSON.stringify(exp, null, 2));
}

// Documentos que chegaram ao estágio $group
function entradaGroup(exp) {
  const cursor = exp.stages[0].$cursor;
  for (let s = cursor.executionStats.executionStages; s; s = s.inputStage) {
    if (s.stage.toLowerCase() === "group") return s.inputStage.nReturned;
  }
  return cursor.executionStats.nReturned;
}
