// =====================================================
// CATÁLOGO LUXURY & HIGH-END - P5.JS 2.3.2
// Estética: Premium Minimalist / Dark Titanium & Gold
// =====================================================
// Revisión de corrección y pulido:
//  - imageMode(CENTER) ahora se aísla con push()/pop() (evita fuga de estado global)
//  - dibujarPin(): se fija textFont/textSize/textStyle ANTES de medir textWidth()
//    (antes el ancho de la etiqueta se calculaba con el tamaño de fuente equivocado)
//  - Layout de catálogo y del panel de interfaz extraído a funciones compartidas
//    (obtenerLayoutCatalogo / obtenerPanelInterfaz) para que dibujarCatalogo(),
//    dibujarInterfaz() y mousePressed() usen SIEMPRE las mismas coordenadas
//  - Posición del bloque OUTPUTS calculada dinámicamente según producto.entradas.length
//    (antes era una Y fija que podía solaparse con INPUTS si cambiaba la cantidad de entradas)
//  - Arrays de imágenes dimensionados dinámicamente según productos.length
//  - Variables globales y experiencia de usuario 100% intactas
// =====================================================

// =====================================================
// BASE DE DATOS DE PRODUCTOS
// =====================================================
let productos = [
  {
    tag: "SERIES I · ESSENTIAL",
    nombre: "MONOLITH COMPACT",
    descripcion: "Ingeniería de precisión con controles analógicos táctiles. Cavidad de 20L y 700W de rendimiento térmico constante.",
    precio: "$89.990",
    entradas: ["Perilla de tiempo micrométrica", "Selector de potencia rotativo", "Manilla de aleación de aluminio"],
    salidas: ["Avisador acústico resonante", "Luz de cavidad blanco cálido", "Plato giratorio de cristal templado"],
    portadaArchivo: "portada_0.png",
    explotadaArchivo: "explotada_0.png"
  },
  {
    tag: "SERIES II · ADVANCED",
    nombre: "MONOLITH DIGITAL",
    descripcion: "Panel de cristal con respuesta háptica y pantalla OLED. 25L de capacidad y motor de microondas de 900W.",
    precio: "$119.990",
    entradas: ["Teclado numérico haptic-touch", "Dial de precisión con pulido concéntrico", "Apertura rápida asistida"],
    salidas: ["Pantalla OLED de alta definición", "Resonador de término de ciclo", "Iluminación de cavidad LED de espectro total"],
    portadaArchivo: "portada_1.png",
    explotadaArchivo: "explotada_1.png"
  },
  {
    tag: "SERIES III · FLAGSHIP",
    nombre: "MONOLITH PRO GRILL",
    descripcion: "Experiencia Full-Touch completa con elemento Grill dorador integrado, 32L de volumen útil y 1100W de potencia.",
    precio: "$159.990",
    entradas: ["Pantalla táctil panorámica Full Glass", "Sensor de proximidad y presencia", "Sistema de apertura electrónica Soft-Open"],
    salidas: ["Display gráfico TrueColor multinivel", "Resistencia superior de Grill Pro-Dorador", "Sistema de alertas sonoras multitono"],
    portadaArchivo: "portada_2.png",
    explotadaArchivo: "explotada_2.png"
  }
];

// Arrays de estado de imágenes, dimensionados según la cantidad real de productos
let imagenesPortada = new Array(productos.length).fill(null);
let imagenesExplotadas = new Array(productos.length).fill(null);
let cargadasPortada = new Array(productos.length).fill(false);
let cargadasExplotadas = new Array(productos.length).fill(false);

let productoSeleccionado = -1;

// =====================================================
// SETUP
// =====================================================
function setup() {
  createCanvas(1200, 780);
  textFont("Georgia"); // Tipografía clásica y elegante

  for (let i = 0; i < productos.length; i++) {
    let index = i;

    loadImage(
      productos[index].portadaArchivo,
      (img) => { imagenesPortada[index] = img; cargadasPortada[index] = true; },
      () => { cargadasPortada[index] = false; }
    );

    loadImage(
      productos[index].explotadaArchivo,
      (img) => { imagenesExplotadas[index] = img; cargadasExplotadas[index] = true; },
      () => { cargadasExplotadas[index] = false; }
    );
  }
}

// =====================================================
// DRAW
// =====================================================
function draw() {
  background(13, 15, 18); // Negro Titanio / Grafito profundo

  if (productoSeleccionado === -1) {
    dibujarCatalogo();
  } else {
    dibujarInterfaz();
  }
}

// =====================================================
// LAYOUT COMPARTIDO (única fuente de verdad para dibujo + clics)
// =====================================================
function obtenerLayoutCatalogo() {
  return {
    ancho: 346,
    alto: 600,
    separacion: 31,
    inicioX: 50,
    inicioY: 125
  };
}

function obtenerRectBotonTarjeta(x, y, w, h) {
  return { bx: x + 25, by: y + h - 60, bw: w - 50, bh: 40 };
}

function obtenerPanelInterfaz() {
  return { panelX: 835, panelY: 100, panelW: 325, panelH: 630 };
}

function obtenerRectBotonVolver(panel) {
  return {
    bx: panel.panelX + 30,
    by: panel.panelY + panel.panelH - 60,
    bw: panel.panelW - 60,
    bh: 40
  };
}

// Y del encabezado OUTPUTS calculada según cuántas entradas tenga el producto,
// para que nunca se solape con la lista de INPUTS aunque cambie su longitud.
function obtenerOutputsHeaderY(panelY, cantidadEntradas) {
  return panelY + 124 + cantidadEntradas * 42;
}

function mouseDentroDe(rect) {
  return mouseX >= rect.bx && mouseX <= rect.bx + rect.bw &&
         mouseY >= rect.by && mouseY <= rect.by + rect.bh;
}

// =====================================================
// VISTA CATÁLOGO LUXURY
// =====================================================
function dibujarCatalogo() {
  // Título de Marca
  noStroke();
  fill(212, 175, 55); // Dorado Champán
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(11);
  textFont("sans-serif");
  text("L U X U R Y   K I T C H E N   C O L L E C T I O N", 50, 42);

  fill(240, 242, 245);
  textFont("Georgia");
  textSize(28);
  text("Colección Monolith", 50, 70);

  stroke(212, 175, 55, 60);
  strokeWeight(0.8);
  line(50, 100, width - 50, 100);

  let layout = obtenerLayoutCatalogo();

  for (let i = 0; i < productos.length; i++) {
    let x = layout.inicioX + i * (layout.ancho + layout.separacion);
    dibujarTarjeta(x, layout.inicioY, layout.ancho, layout.alto, productos[i], i);
  }
}

function dibujarTarjeta(x, y, w, h, producto, index) {
  let boton = obtenerRectBotonTarjeta(x, y, w, h);
  let encimaBoton = mouseDentroDe(boton);

  // Tarjeta Contenedor con borde metálico fino
  stroke(255, 255, 255, 15);
  strokeWeight(1);
  fill(20, 23, 28);
  rect(x, y, w, h, 6);

  // Tag / Serie
  noStroke();
  fill(212, 175, 55);
  textFont("sans-serif");
  textAlign(LEFT, CENTER);
  textSize(9);
  textStyle(BOLD);
  text(producto.tag, x + 25, y + 28);

  // Marco Imagen
  let boxX = x + 20;
  let boxY = y + 50;
  let boxW = w - 40;
  let boxH = 240;

  fill(10, 12, 15);
  stroke(255, 255, 255, 10);
  strokeWeight(0.8);
  rect(boxX, boxY, boxW, boxH, 4);

  let img = imagenesPortada[index];

  if (cargadasPortada[index] && img && img.width > 0) {
    push(); // aísla imageMode(CENTER) para que no afecte otros dibujos
    imageMode(CENTER);
    let escala = min((boxW - 30) / img.width, (boxH - 30) / img.height);
    image(img, boxX + boxW / 2, boxY + boxH / 2, img.width * escala, img.height * escala);
    pop();
  } else {
    // Dibujo vectorial sobrio de reserva
    push();
    translate(boxX + boxW / 2 - 80, boxY + boxH / 2 - 45);
    stroke(212, 175, 55, 150); strokeWeight(1); fill(20, 23, 28);
    rect(0, 0, 160, 90, 2);
    fill(10); stroke(50);
    rect(10, 10, 100, 70, 2);
    pop();
  }

  // Título del Modelo
  noStroke();
  fill(245, 245, 247);
  textFont("Georgia");
  textSize(19);
  textStyle(NORMAL);
  text(producto.nombre, x + 25, y + 320);

  // Descripción
  fill(160, 165, 175);
  textFont("sans-serif");
  textSize(12);
  textLeading(18);
  text(producto.descripcion, x + 25, y + 348, w - 50, 60);

  // Precio
  fill(212, 175, 55);
  textFont("Georgia");
  textSize(22);
  text(producto.precio, x + 25, y + 430);

  // Botón "Explorar Interfaz"
  if (encimaBoton) {
    fill(212, 175, 55);
    stroke(212, 175, 55);
  } else {
    noFill();
    stroke(212, 175, 55, 180);
  }
  strokeWeight(1);
  rect(boton.bx, boton.by, boton.bw, boton.bh, 2);

  noStroke();
  fill(encimaBoton ? color(13, 15, 18) : color(212, 175, 55));
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  text("VER ESPECIFICACIONES Y UI  →", boton.bx + boton.bw / 2, boton.by + boton.bh / 2);
}

// =====================================================
// VISTA INTERFAZ EXPLOTADA LUXURY
// =====================================================
function dibujarInterfaz() {
  let producto = productos[productoSeleccionado];
  let panel = obtenerPanelInterfaz();

  // Encabezado
  noStroke();
  fill(212, 175, 55);
  textFont("sans-serif");
  textAlign(LEFT, CENTER);
  textSize(10);
  textStyle(BOLD);
  text("A R C H I T E C T U R A   D E   U S U A R I O", 40, 38);

  fill(245, 245, 247);
  textFont("Georgia");
  textSize(26);
  textStyle(NORMAL);
  text(producto.nombre, 40, 65);

  // Marco de la Imagen Explotada
  let imgX = 40;
  let imgY = 100;
  let imgW = 770;
  let imgH = 630;

  fill(18, 21, 26);
  stroke(255, 255, 255, 15);
  strokeWeight(1);
  rect(imgX, imgY, imgW, imgH, 6);

  let img = imagenesExplotadas[productoSeleccionado];

  if (cargadasExplotadas[productoSeleccionado] && img && img.width > 0) {
    push(); // aísla imageMode(CENTER)
    imageMode(CENTER);
    let escala = min((imgW - 50) / img.width, (imgH - 50) / img.height);
    image(img, imgX + imgW / 2, imgY + imgH / 2, img.width * escala, img.height * escala);
    pop();
  } else {
    dibujarDespieceUIEstetico(imgX + imgW / 2, imgY + imgH / 2, productoSeleccionado);
  }

  // Panel Lateral Luxury
  fill(18, 21, 26);
  stroke(255, 255, 255, 15);
  strokeWeight(1);
  rect(panel.panelX, panel.panelY, panel.panelW, panel.panelH, 6);

  // --- CONTROLES DE ENTRADA (INPUTS) ---
  noStroke();
  fill(212, 175, 55);
  textFont("sans-serif");
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  text("INPUTS · CONTROLES DE ENTRADA", panel.panelX + 30, panel.panelY + 30);

  stroke(212, 175, 55, 40);
  strokeWeight(0.8);
  line(panel.panelX + 30, panel.panelY + 48, panel.panelX + panel.panelW - 30, panel.panelY + 48);

  noStroke();
  textFont("sans-serif");
  textSize(12);
  textStyle(NORMAL);
  for (let i = 0; i < producto.entradas.length; i++) {
    fill(212, 175, 55);
    text("—", panel.panelX + 30, panel.panelY + 62 + i * 42);
    fill(210, 215, 225);
    text(producto.entradas[i], panel.panelX + 48, panel.panelY + 62 + i * 42, panel.panelW - 78, 36);
  }

  // --- RESPUESTAS DE SALIDA (OUTPUTS) ---
  // Posición calculada dinámicamente según la cantidad de entradas,
  // para que nunca se solape con la lista de INPUTS.
  let outputsHeaderY = obtenerOutputsHeaderY(panel.panelY, producto.entradas.length);

  fill(212, 175, 55);
  textSize(10);
  textStyle(BOLD);
  text("OUTPUTS · RESPUESTAS DEL SISTEMA", panel.panelX + 30, outputsHeaderY);

  stroke(212, 175, 55, 40);
  strokeWeight(0.8);
  line(panel.panelX + 30, outputsHeaderY + 18, panel.panelX + panel.panelW - 30, outputsHeaderY + 18);

  noStroke();
  textFont("sans-serif");
  textSize(12);
  textStyle(NORMAL);
  for (let i = 0; i < producto.salidas.length; i++) {
    fill(212, 175, 55);
    text("—", panel.panelX + 30, outputsHeaderY + 32 + i * 42);
    fill(210, 215, 225);
    text(producto.salidas[i], panel.panelX + 48, outputsHeaderY + 32 + i * 42, panel.panelW - 78, 36);
  }

  // Botón Volver
  let boton = obtenerRectBotonVolver(panel);
  let encima = mouseDentroDe(boton);

  if (encima) {
    fill(212, 175, 55);
    stroke(212, 175, 55);
  } else {
    noFill();
    stroke(255, 255, 255, 40);
  }
  strokeWeight(1);
  rect(boton.bx, boton.by, boton.bw, boton.bh, 2);

  noStroke();
  fill(encima ? color(13, 15, 18) : color(240, 240, 245));
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  text("← VOLVER AL CATÁLOGO", boton.bx + boton.bw / 2, boton.by + boton.bh / 2);
}

// =====================================================
// DESPIECE VECTORIAL DE RESPALDO (ELEGANTE)
// =====================================================
function dibujarDespieceUIEstetico(cx, cy, tipo) {
  push();
  translate(cx - 15, cy + 10);

  stroke(60, 65, 75); strokeWeight(1);
  drawingContext.setLineDash([4, 4]);
  line(-250, 0, 240, 0);
  drawingContext.setLineDash([]);

  // Puerta
  let pX = -220, pY = -120;
  fill(25, 28, 34); stroke(212, 175, 55, 100); strokeWeight(1);
  rect(pX, pY, 130, 240, 4);
  fill(10); noStroke();
  rect(pX + 10, pY + 12, 90, 216, 2);

  // Cavidad
  let cX = -50, cY = -110;
  fill(20, 23, 28); stroke(60); strokeWeight(1);
  rect(cX, cY, 170, 220, 4);
  fill(10);
  rect(cX + 10, cY + 10, 150, 200, 2);

  // Panel
  let panX = 160, panY = -120;
  fill(15, 18, 22); stroke(212, 175, 55, 120); strokeWeight(1);
  rect(panX, panY, 80, 240, 4);

  // Pines
  dibujarPin(pX + 112, pY + 120, pX + 50, pY - 45, "ENTRADA: Manilla Apertura", color(212, 175, 55));
  dibujarPin(panX + 40, panY + 120, panX + 115, panY + 120, "ENTRADA: Panel de Mandos", color(212, 175, 55));
  dibujarPin(panX + 40, panY + 31, panX + 115, panY + 31, "SALIDA: Display Digital", color(200, 205, 215));

  pop();
}

function dibujarPin(sx, sy, tx, ty, texto, col) {
  stroke(col); strokeWeight(1); fill(col);
  circle(sx, sy, 4); line(sx, sy, tx, ty);

  // Fuente y tamaño deben fijarse ANTES de medir textWidth(),
  // de lo contrario el ancho se calcula con el tamaño de fuente
  // que haya quedado activo de una llamada anterior (caja mal dimensionada).
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(9);
  textAlign(CENTER, CENTER);

  noStroke(); rectMode(CENTER);
  fill(15, 18, 22); stroke(col); strokeWeight(0.8);
  rect(tx, ty, textWidth(texto) + 20, 22, 2);

  noStroke(); fill(col);
  text(texto, tx, ty);
  rectMode(CORNER);
}

// =====================================================
// EVENTOS MOUSE
// =====================================================
function mousePressed() {
  if (productoSeleccionado !== -1) {
    let panel = obtenerPanelInterfaz();
    let boton = obtenerRectBotonVolver(panel);

    if (mouseDentroDe(boton)) {
      productoSeleccionado = -1;
    }
    return;
  }

  let layout = obtenerLayoutCatalogo();

  for (let i = 0; i < productos.length; i++) {
    let x = layout.inicioX + i * (layout.ancho + layout.separacion);
    let boton = obtenerRectBotonTarjeta(x, layout.inicioY, layout.ancho, layout.alto);

    if (mouseDentroDe(boton)) {
      productoSeleccionado = i;
      return;
    }
  }
}