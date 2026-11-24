// B2 - Debug Arquitetural
// CLASSE_ALVO = "Refrigerado"
db = db.getSiblingDB("logiporto");

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
}

const original = [
  { $project: { terminal: 1, classe: 1 } },
  {
    $group: {
      _id: { terminal: "$terminal", classe: "$classe" },
      kg_total: { $sum: "peso_kg" },
      mov: { $sum: 1 }
    }
  },
  { $limit: 3 },
  { $sort: { kg_total: -1 } },
  { $match: { "_id.classe": "Refrigerado" } }
];
print("===== B2 a) saída do pipeline original =====");
printjson(db.movimentacoes.aggregate(original).toArray());

print("\n===== B2 a) o mesmo pipeline original executado mais 5 vezes =====");
for (let i = 1; i <= 5; i++) {
  print("execução " + i + ": " + JSON.stringify(db.movimentacoes.aggregate(original).toArray()));
}

const corrigido = [
  { $match: { classe: "Refrigerado" } },
  { $group: { _id: "$terminal", kg_total: { $sum: "$peso_kg" }, mov: { $sum: 1 } } },
  { $sort: { kg_total: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, terminal: "$_id", kg_total: "$kg_total", mov: "$mov" } }
];
db.movimentacoes.createIndex({ classe: 1, ts: 1, terminal: 1, peso_kg: 1 });

print("\n===== B2 c) saída do pipeline corrigido =====");
const resultado = db.movimentacoes.aggregate(corrigido).toArray();
printjson(resultado);

print("\n===== B2 c) comprovação: soma independente em JavaScript =====");
const soma = {};
db.movimentacoes.find({ classe: "Refrigerado" }, { _id: 0, terminal: 1, peso_kg: 1 }).forEach(d => {
  soma[d.terminal] = soma[d.terminal] || { terminal: d.terminal, kg_total: 0, mov: 0 };
  soma[d.terminal].kg_total += d.peso_kg;
  soma[d.terminal].mov += 1;
});
const ranking = Object.values(soma).sort((a, b) => b.kg_total - a.kg_total);
printjson(ranking);
print("top 3 iguais ao pipeline corrigido: " + (JSON.stringify(ranking.slice(0, 3)) === JSON.stringify(resultado)));

const t4 = soma["T4"];
print("T4: mov = " + t4.mov + " | kg_total % 99991 = " + (t4.kg_total % 99991) + " -> LP-260065492-" + t4.mov + "-" + (t4.kg_total % 99991));

resumo("B2 d) explain do pipeline original", db.movimentacoes.explain("executionStats").aggregate(original));
resumo("B2 d) explain do pipeline corrigido", db.movimentacoes.explain("executionStats").aggregate(corrigido));
