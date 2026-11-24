// A2 - Incidente no pátio
// INCIDENTE copiado do Google Maps ("lat, lon"): -25.4580, -48.4730
// GeoJSON exige [longitude, latitude] -> [-48.4730, -25.4580]
db = db.getSiblingDB("logiporto");

// Garante o cenário "antes do índice" (remove o 2dsphere se já existir; o índice ESR do A1 continua)
if (db.movimentacoes.getIndexes().some(i => i.name === "posicao_2dsphere")) db.movimentacoes.dropIndex("posicao_2dsphere");

// 1) Antes do índice 2dsphere
print("===== A2 1) antes do índice 2dsphere =====");
try {
  db.movimentacoes.find({
    posicao: { $near: { $geometry: { type: "Point", coordinates: [-48.4730, -25.4580] }, $maxDistance: 300 } }
  }).limit(10).toArray();
} catch (e) {
  print("ERRO: " + e.message);
}

// 2) Índice geoespacial adequado
print("\n===== A2 2) createIndex 2dsphere =====");
print(db.movimentacoes.createIndex({ posicao: "2dsphere" }));

// 3) Armadilha: coordenadas na ordem do Google Maps [lat, lon]
print("\n===== A2 3) coordenadas na ordem do Google Maps [lat, lon] =====");
print("documentos retornados: " + db.movimentacoes.find({
  posicao: { $near: { $geometry: { type: "Point", coordinates: [-25.4580, -48.4730] }, $maxDistance: 300 } }
}).limit(10).toArray().length);

// 4) Consulta correta [lon, lat]: até 10 registros, raio de 300 m, ordenados por proximidade
print("\n===== A2 4) resultado [lon, lat] =====");
printjson(db.movimentacoes.find({
  posicao: { $near: { $geometry: { type: "Point", coordinates: [-48.4730, -25.4580] }, $maxDistance: 300 } }
}, { _id: 0, container: 1, tipo: 1, terminal: 1, posicao: 1 }).limit(10).toArray());

// 5) Conferência da ordem: mesma busca com $geoNear, que devolve a distância em metros
print("\n===== A2 5) distâncias ($geoNear) =====");
db.movimentacoes.aggregate([
  { $geoNear: { near: { type: "Point", coordinates: [-48.4730, -25.4580] }, distanceField: "distancia_m", maxDistance: 300, spherical: true } },
  { $limit: 10 },
  { $project: { _id: 0, container: 1, distancia_m: { $round: ["$distancia_m", 1] } } }
]).forEach(d => print(d.container + "  " + d.distancia_m + " m"));

// 6) explain("executionStats") da consulta correta
print("\n===== A2 6) explain executionStats =====");
const exp = db.movimentacoes.find({
  posicao: { $near: { $geometry: { type: "Point", coordinates: [-48.4730, -25.4580] }, $maxDistance: 300 } }
}).limit(10).explain("executionStats");
const s = exp.executionStats;
const plano = [];
for (let e = s.executionStages; e; e = e.inputStage) {
  plano.push(e.inputStages ? e.stage + " [" + e.inputStages.length + "x " + e.inputStages[0].stage + " <- " + e.inputStages[0].inputStage.stage + "]" : e.stage);
}
printjson({
  stage: plano.join(" <- "),
  totalDocsExamined: s.totalDocsExamined,
  totalKeysExamined: s.totalKeysExamined,
  nReturned: s.nReturned,
  executionTimeMillis: s.executionTimeMillis
});
print(EJSON.stringify(exp, null, 2));
