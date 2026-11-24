const [lat, lon] = INCIDENTE.split(",").map(Number);

const consultaA2 = (coordenadas) => db.movimentacoes.find({
  posicao: {
    $near: {
      $geometry: { type: "Point", coordinates: coordenadas },
      $maxDistance: 300
    }
  }
}).limit(10);

print("\n===== A2 antes do índice =====");
try {
  consultaA2([lon, lat]).toArray();
} catch (e) {
  print(e.message);
}

db.movimentacoes.createIndex({ posicao: "2dsphere" });

print("\n===== A2 coordenadas [lat, lon] =====");
print("documentos retornados: " + consultaA2([lat, lon]).toArray().length);

print("\n===== A2 resultado [lon, lat] =====");
printjson(consultaA2([lon, lat]).toArray());
resumo("A2 com índice 2dsphere", consultaA2([lon, lat]).explain("executionStats"));


