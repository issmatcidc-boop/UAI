let imagenMicroondas;

let productos = [
  {
    nombre: "MICROONDAS COMPACT",
    descripcion: "Diseño compacto para espacios reducidos.",
    precio: "$89.990"
  },
  {
    nombre: "MICROONDAS DIGITAL",
    descripcion: "Control digital intuitivo y pantalla LED.",
    precio: "$119.990"
  },
  {
    nombre: "MICROONDAS PRO",
    descripcion: "Mayor capacidad y funciones avanzadas.",
    precio: "$159.990"
  }
];

let productoSeleccionado = -1;


// =====================================================
// CARGAR IMAGEN
// =====================================================

function preload() {

  imagenMicroondas = loadImage("microondas.png");

}


// =====================================================
// CONFIGURACIÓN
// =====================================================

function setup() {

  createCanvas(1200, 750);

  textFont("Arial");

}


// =====================================================
// PANTALLA PRINCIPAL
// =====================================================

function draw() {

  background(242);


  // =========================================
  // TÍTULO
  // =========================================

  fill(25);
  noStroke();

  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(32);

  text(
    "MICROONDAS",
    50,
    45
  );


  textStyle(NORMAL);
  textSize(15);
  fill(100);

  text(
    "Catálogo de productos · Interfaz y funcionamiento",
    50,
    80
  );


  // Línea

  stroke(210);
  strokeWeight(1);

  line(
    50,
    110,
    width - 50,
    110
  );


  // =========================================
  // TARJETAS
  // =========================================

  let ancho = 340;
  let alto = 520;

  let separacion = 40;

  let inicioX = 50;
  let inicioY = 145;


  for (let i = 0; i < 3; i++) {

    let x =
      inicioX +
      i * (ancho + separacion);


    dibujarProducto(
      x,
      inicioY,
      ancho,
      alto,
      productos[i],
      i
    );

  }


  // =========================================
  // INTERFAZ ABIERTA
  // =========================================

  if (productoSeleccionado != -1) {

    dibujarInterfaz(
      productos[productoSeleccionado]
    );

  }

}


// =====================================================
// TARJETA DEL PRODUCTO
// =====================================================

function dibujarProducto(
  x,
  y,
  w,
  h,
  producto,
  numero
) {

  // Sombra

  noStroke();

  fill(215);

  rect(
    x + 6,
    y + 7,
    w,
    h,
    15
  );


  // Tarjeta

  fill(255);

  rect(
    x,
    y,
    w,
    h,
    15
  );


  // Número

  fill(35);

  rect(
    x + 20,
    y + 20,
    100,
    28,
    14
  );


  fill(255);

  textAlign(CENTER, CENTER);

  textStyle(BOLD);

  textSize(11);

  text(
    "PRODUCTO " + (numero + 1),
    x + 70,
    y + 34
  );


  // =========================================
  // REPRESENTACIÓN DEL MICROONDAS
  // =========================================

  dibujarMicroondas(
    x + w / 2,
    y + 180,
    270,
    160,
    numero
  );


  // =========================================
  // NOMBRE
  // =========================================

  fill(25);

  textAlign(LEFT, CENTER);

  textStyle(BOLD);

  textSize(19);

  text(
    producto.nombre,
    x + 20,
    y + 315
  );


  // =========================================
  // DESCRIPCIÓN
  // =========================================

  fill(100);

  textStyle(NORMAL);

  textSize(13);

  text(
    producto.descripcion,
    x + 20,
    y + 350
  );


  // =========================================
  // PRECIO
  // =========================================

  fill(25);

  textStyle(BOLD);

  textSize(21);

  text(
    producto.precio,
    x + 20,
    y + 395
  );


  // =========================================
  // BOTÓN
  // =========================================

  let bx = x + 20;
  let by = y + 435;

  let bw = w - 40;
  let bh = 45;


  let encima =
    mouseX > bx &&
    mouseX < bx + bw &&
    mouseY > by &&
    mouseY < by + bh;


  if (encima) {

    fill(65);

  } else {

    fill(25);

  }


  rect(
    bx,
    by,
    bw,
    bh,
    22
  );


  fill(255);

  textAlign(CENTER, CENTER);

  textStyle(BOLD);

  textSize(12);

  text(
    "VER INTERFAZ",
    bx + bw / 2,
    by + bh / 2
  );

}


// =====================================================
// DIBUJAR MICROONDAS DE LA PÁGINA PRINCIPAL
// =====================================================

function dibujarMicroondas(
  x,
  y,
  w,
  h,
  tipo
) {

  push();

  translate(
    x - w / 2,
    y - h / 2
  );


  // Cuerpo

  fill(60);

  stroke(30);

  strokeWeight(2);

  rect(
    0,
    0,
    w,
    h,
    12
  );


  // Frente

  fill(35);

  noStroke();

  rect(
    10,
    10,
    w - 20,
    h - 20,
    8
  );


  // Puerta

  fill(15);

  rect(
    22,
    25,
    155,
    110,
    5
  );


  // Vidrio

  fill(25);

  rect(
    29,
    32,
    141,
    96,
    3
  );


  // Manilla

  stroke(180);

  strokeWeight(5);

  line(
    185,
    45,
    185,
    115
  );


  // Panel

  noStroke();

  fill(20);

  rect(
    200,
    20,
    55,
    120,
    5
  );


  // Pantalla

  fill(5);

  rect(
    207,
    28,
    41,
    25,
    3
  );


  fill(100, 255, 120);

  textAlign(CENTER, CENTER);

  textSize(9);

  text(
    "12:00",
    227,
    40
  );


  // Botones

  for (
    let fila = 0;
    fila < 3;
    fila++
  ) {

    for (
      let col = 0;
      col < 2;
      col++
    ) {

      fill(120);

      ellipse(
        215 + col * 20,
        68 + fila * 20,
        10,
        10
      );

    }

  }


  // Perilla

  fill(160);

  ellipse(
    228,
    123,
    20,
    20
  );


  pop();

}


// =====================================================
// INTERFAZ CON LA LÁMINA EXPLOTADA
// =====================================================

function dibujarInterfaz(producto) {

  // =========================================
  // FONDO OSCURO
  // =========================================

  fill(0, 0, 0, 170);

  noStroke();

  rect(
    0,
    0,
    width,
    height
  );


  // =========================================
  // VENTANA PRINCIPAL
  // =========================================

  let ventanaX = 35;
  let ventanaY = 25;

  let ventanaW = width - 70;
  let ventanaH = height - 50;


  fill(255);

  rect(
    ventanaX,
    ventanaY,
    ventanaW,
    ventanaH,
    18
  );


  // =========================================
  // TÍTULO
  // =========================================

  fill(25);

  textAlign(LEFT, CENTER);

  textStyle(BOLD);

  textSize(25);

  text(
    producto.nombre,
    ventanaX + 25,
    ventanaY + 35
  );


  textStyle(NORMAL);

  textSize(13);

  fill(100);

  text(
    "Análisis de interfaz del producto",
    ventanaX + 25,
    ventanaY + 65
  );


  // =========================================
  // IMAGEN DE LA VISTA EXPLOTADA
  // =========================================

  let imgX = ventanaX + 25;
  let imgY = ventanaY + 90;

  let imgW = 720;
  let imgH = 570;


  // Fondo de imagen

  fill(245);

  noStroke();

  rect(
    imgX,
    imgY,
    imgW,
    imgH,
    10
  );


  // Ajustar imagen manteniendo proporción

  let escala = min(
    imgW / imagenMicroondas.width,
    imgH / imagenMicroondas.height
  );


  let nuevoW =
    imagenMicroondas.width * escala;

  let nuevoH =
    imagenMicroondas.height * escala;


  imageMode(CORNER);

  image(
    imagenMicroondas,
    imgX + (imgW - nuevoW) / 2,
    imgY + (imgH - nuevoH) / 2,
    nuevoW,
    nuevoH
  );


  // =========================================
  // PANEL DERECHO
  // =========================================

  let panelX = 790;

  let panelY = ventanaY + 90;

  let panelW = 340;


  // =========================================
  // ENTRADAS
  // =========================================

  fill(25);

  textAlign(LEFT, TOP);

  textStyle(BOLD);

  textSize(17);

  text(
    "ENTRADAS DE INTERFAZ",
    panelX,
    panelY
  );


  fill(90);

  textStyle(NORMAL);

  textSize(14);

  text(
    "FÍSICAS",
    panelX,
    panelY + 38
  );


  text(
    "• Puerta del microondas",
    panelX,
    panelY + 65
  );


  text(
    "• Botones de control",
    panelX,
    panelY + 90
  );


  text(
    "• Perilla de selección",
    panelX,
    panelY + 115
  );


  // =========================================
  // SALIDAS
  // =========================================

  fill(25);

  textStyle(BOLD);

  textSize(17);

  text(
    "SALIDAS DE INTERFAZ",
    panelX,
    panelY + 175
  );


  // Sonora

  fill(90);

  textStyle(BOLD);

  textSize(14);

  text(
    "SONORA",
    panelX,
    panelY + 215
  );


  textStyle(NORMAL);

  text(
    "• Pitidos de confirmación",
    panelX,
    panelY + 240
  );


  text(
    "• Aviso al finalizar",
    panelX,
    panelY + 265
  );


  // Física

  textStyle(BOLD);

  text(
    "FÍSICA",
    panelX,
    panelY + 310
  );


  textStyle(NORMAL);

  text(
    "• Calor generado",
    panelX,
    panelY + 335
  );


  text(
    "• Movimiento del plato",
    panelX,
    panelY + 360
  );


  // Acústica / visual

  textStyle(BOLD);

  text(
    "ACÚSTICA / VISUAL",
    panelX,
    panelY + 405
  );


  textStyle(NORMAL);

  text(
    "• Pantalla digital",
    panelX,
    panelY + 430
  );


  text(
    "• Luz interior",
    panelX,
    panelY + 455
  );


  // =========================================
  // PRECIO
  // =========================================

  fill(25);

  textStyle(BOLD);

  textSize(20);

  text(
    producto.precio,
    panelX,
    panelY + 505
  );


  // =========================================
  // BOTÓN CERRAR
  // =========================================

  let cerrarX = panelX;
  let cerrarY = ventanaY + ventanaH - 60;

  let cerrarW = 150;
  let cerrarH = 40;


  let encima =
    mouseX > cerrarX &&
    mouseX < cerrarX + cerrarW &&
    mouseY > cerrarY &&
    mouseY < cerrarY + cerrarH;


  fill(encima ? 70 : 25);

  rect(
    cerrarX,
    cerrarY,
    cerrarW,
    cerrarH,
    20
  );


  fill(255);

  textAlign(
    CENTER,
    CENTER
  );

  textStyle(BOLD);

  textSize(12);

  text(
    "CERRAR",
    cerrarX + cerrarW / 2,
    cerrarY + cerrarH / 2
  );

}


// =====================================================
// INTERACCIÓN CON EL MOUSE
// =====================================================

function mousePressed() {

  // =========================================
  // SI LA INTERFAZ ESTÁ ABIERTA
  // =========================================

  if (productoSeleccionado != -1) {

    let ventanaY = 25;

    let panelX = 790;

    let cerrarX = panelX;

    let cerrarY =
      ventanaY +
      (height - 50) -
      60;


    if (
      mouseX > cerrarX &&
      mouseX < cerrarX + 150 &&
      mouseY > cerrarY &&
      mouseY < cerrarY + 40
    ) {

      productoSeleccionado = -1;

    }


    return;

  }


  // =========================================
  // BOTONES DE LOS PRODUCTOS
  // =========================================

  let ancho = 340;

  let separacion = 40;

  let inicioX = 50;

  let inicioY = 145;


  for (let i = 0; i < 3; i++) {

    let x =
      inicioX +
      i * (ancho + separacion);


    let botonX = x + 20;

    let botonY =
      inicioY + 435;


    let botonW = ancho - 40;

    let botonH = 45;


    if (
      mouseX > botonX &&
      mouseX < botonX + botonW &&
      mouseY > botonY &&
      mouseY < botonY + botonH
    ) {

      productoSeleccionado = i;

    }

  }

}