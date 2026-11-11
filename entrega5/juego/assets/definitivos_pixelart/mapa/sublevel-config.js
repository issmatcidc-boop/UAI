/* Fuente única para el orden, los límites y la historia de los subniveles. */
(() => {
  const vestibule = {
    length: 3620,
    elvira: 218,
    crate: 1430,
    gate: 1990,
    station: 2200,
    warehouse: { start: 1170, end: 1986 },
    record: { x: 1772, y: 150 },
    boards: [{ x: 622, w: 115 }, { x: 973, w: 113 }, { x: 2810, w: 126 }, { x: 3120, w: 116 }],
    ledges: [
      { x: 460, y: 188, w: 184 }, { x: 677, y: 161, w: 161 },
      { x: 861, y: 176, w: 179 }, { x: 1320, y: 188, w: 136 },
      { x: 1454, y: 150, w: 376 }, { x: 1825, y: 187, w: 103 },
      { x: 2475, y: 190, w: 156 }, { x: 2655, y: 157, w: 164 },
      { x: 2848, y: 140, w: 165 }, { x: 3041, y: 157, w: 166 },
      { x: 3246, y: 184, w: 136 }
    ],
    encounters: [
      { kind: "shadow", sprite: 2, x: 635, left: 594, right: 1007, speed: 49 },
      { kind: "shelf", sprite: 0, x: 1538, left: 1518, right: 1687, speed: 57, floor: 150 },
      { kind: "guard", sprite: 1, x: 3020, home: 3020, left: 2790, right: 3374 }
    ],
    hints: [
      [65, 348, "ABAJO · HABLA CON ELVIRA"],
      [356, 587, "SIGILO O SALTA A LA REPISA"],
      [604, 820, "LAS TABLAS CRUJEN AL CORRER"],
      [1180, 1350, "ALMACÉN · BUSCA LA CAJA MARCADA"],
      [1480, 1578, "REPISA · LÁMPARA OPCIONAL"],
      [2070, 2320, "ABAJO · REVELA LA HUELLA"],
      [2440, 2730, "ESCALERA · SALTA O AVANZA EN SIGILO"]
    ]
  };
  window.MANSION_VESTIBULE = vestibule;
  let end = 0;
  const stages = [
    { name: "VESTÍBULO", subtitle: "La entrada y el primer rastro", clue: "HUELLA CON BARNIZ", length: vestibule.length, hazard: { kind: "soga", offset: 1115 }, playable: true },
    { name: "GALERÍA DE RETRATOS", subtitle: "La fibra violeta", clue: "FIBRA VIOLETA", length: 1550, hazard: { kind: "red", offset: 1192 }, playable: true },
    { name: "ALA DE SERVICIO", subtitle: "La cocina y el personal", clue: "REGISTRO DE MANTENCIÓN", length: 1750, hazard: { kind: "cepo", offset: 1130 }, playable: true },
    { name: "INVERNADERO", subtitle: "El jardín y las huellas", clue: "HUELLAS EN LA TIERRA", length: 1800, playable: true },
    { name: "BIBLIOTECA Y PASADIZO", subtitle: "El plano oculto", clue: "PLANO DEL PASADIZO", length: 1850, playable: true },
    { name: "ÁTICO", subtitle: "El careo y la revelación", clue: "DEDUCCIÓN FINAL", length: 1850, playable: true }
  ].map(({ length, ...stage }) => {
    const start = end;
    end += length;
    return { ...stage, start, end };
  });
  window.MANSION_SUBLEVELS = stages;
  window.mansionStageX = (index, fraction) => {
    const stage = stages[Math.max(0, Math.min(stages.length - 1, index | 0))];
    return stage.start + (stage.end - stage.start) * Math.max(0, Math.min(1, fraction));
  };
})();
