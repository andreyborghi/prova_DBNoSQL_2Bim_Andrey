// A1 - Painel do pátio
const consultaA1 = () => db.movimentacoes.find({
  terminal: TERMINAL_ALVO,
  classe: CLASSE_ALVO,
  ts: { $gte: DATA_CORTE }
}).sort({ peso_kg: -1 }).limit(20);

// a) Sem nenhum índice além do _id
db.movimentacoes.dropIndexes();
resumo("A1 a) sem índice", consultaA1().explain("executionStats"));

// b) Índice na ordem do filtro
db.movimentacoes.createIndex({ terminal: 1, classe: 1, ts: 1, peso_kg: -1 });
resumo("A1 b) índice na ordem do filtro", consultaA1().explain("executionStats"));

// c) Índice ESR: Igualdade (terminal, classe) -> Sort (peso_kg) -> Range (ts)
db.movimentacoes.dropIndex({ terminal: 1, classe: 1, ts: 1, peso_kg: -1 });
db.movimentacoes.createIndex({ terminal: 1, classe: 1, peso_kg: -1, ts: 1 });
resumo("A1 c) índice ESR", consultaA1().explain("executionStats"));





