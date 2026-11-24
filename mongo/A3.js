// A3 - O TTL que não apaga
// Retenção: 30 dias = 30 * 24 * 60 * 60 = 2592000 segundos
db = db.getSiblingDB("logiporto");

// 1) Cenário do desenvolvedor anterior: índice TTL em alertas.registrado_em
print("===== A3 1) índice TTL criado =====");
db.alertas.dropIndexes();
db.alertas.createIndex({ registrado_em: 1 }, { expireAfterSeconds: 2592000 });
printjson(db.alertas.getIndexes());

// 2) Comprovação: tipo BSON gravado em registrado_em
print("\n===== A3 2) tipo BSON de registrado_em =====");
printjson(db.alertas.aggregate([
  { $group: { _id: { $type: "$registrado_em" }, total: { $sum: 1 } } }
]).toArray());
printjson(db.alertas.findOne({}, { _id: 0 }));

// 3) Todos já passaram dos 30 dias e continuam no banco
print("\n===== A3 3) alertas com mais de 30 dias ainda no banco =====");
const limite = new Date(Date.now() - 2592000 * 1000);
print("limite (agora - 30 dias): " + limite.toISOString());
print("alertas mais antigos que o limite: " + db.alertas.countDocuments({ registrado_em: { $lt: limite.toISOString() } }) + " de " + db.alertas.countDocuments());

// 4) Contraprova: um alerta gravado como Date, com 31 dias, é apagado pelo TTL monitor (roda a cada 60 s)
print("\n===== A3 4) contraprova com registrado_em do tipo Date =====");
const antes = db.serverStatus().metrics.ttl;
db.alertas.insertOne({ sensor: "TESTE_TTL", nivel: "info", registrado_em: new Date(Date.now() - 31 * 86400000) });
print("alerta de teste (Date, 31 dias) inserido: " + db.alertas.countDocuments({ sensor: "TESTE_TTL" }));
let seg = 0;
while (db.alertas.countDocuments({ sensor: "TESTE_TTL" }) > 0 && seg < 150) { sleep(5000); seg += 5; }
const depois = db.serverStatus().metrics.ttl;
print("alerta de teste após ~" + seg + " s: " + db.alertas.countDocuments({ sensor: "TESTE_TTL" }));
print("passagens do TTL monitor no período: " + (depois.passes - antes.passes));
print("documentos apagados pelo TTL no período: " + (depois.deletedDocuments - antes.deletedDocuments));
print("alertas com registrado_em String: " + db.alertas.countDocuments({ registrado_em: { $type: "string" } }));
