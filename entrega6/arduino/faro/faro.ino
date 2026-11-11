/*
  Faro en Morse con tira de 8 LEDs (WS2812 / NeoPixel)
  ----------------------------------------------------
  Conexión: 5V -> 5V, GND -> GND, DIN (entrada de datos) -> pin 4
  Recibe palabras por USB desde controlador.html y las emite en Morse.
*/

#include <Adafruit_NeoPixel.h>

// ---------- Configuración ----------
const byte PIN_LEDS = 4;
const byte CANTIDAD_LEDS = 8;
const byte BRILLO = 80;                           // 0 a 255. Más bajo = menos consumo

Adafruit_NeoPixel tira(CANTIDAD_LEDS, PIN_LEDS, NEO_GRB + NEO_KHZ800);
const uint32_t COLOR_ENCENDIDO = 0xFFB400;        // ámbar. Formato 0xRRGGBB

// Debe ser igual a UNIDAD en controlador.html
const unsigned int UNIDAD = 200;                  // ms que dura un punto

const unsigned int PUNTO         = UNIDAD;
const unsigned int RAYA          = 3 * UNIDAD;
const unsigned int PAUSA_SIMBOLO = UNIDAD;        // entre puntos y rayas
const unsigned int PAUSA_LETRA   = 2 * UNIDAD;    // se suma a la anterior: 3 en total
const unsigned int PAUSA_PALABRA = 4 * UNIDAD;    // se suma a la anterior: 7 en total

const byte MAX_TEXTO = 32;                        // largo máximo de lo que se recibe

// Alfabeto Morse de la A a la Z
const char* const MORSE[26] = {
  ".-",   "-...", "-.-.", "-..",  ".",    "..-.", "--.",  "....", "..",   ".---",
  "-.-",  ".-..", "--",   "-.",   "---",  ".--.", "--.-", ".-.",  "...",  "-",
  "..-",  "...-", ".--",  "-..-", "-.--", "--.."
};

// ---------- LEDs ----------
void encenderLeds(bool encendido) {
  tira.fill(encendido ? COLOR_ENCENDIDO : 0);
  tira.show();
}

// Enciende los LEDs durante "duracion" ms y deja la pausa entre símbolos
void pulso(unsigned int duracion) {
  encenderLeds(true);
  delay(duracion);
  encenderLeds(false);
  delay(PAUSA_SIMBOLO);
}

// ---------- Morse ----------
void emitirLetra(char letra) {
  if (letra == ' ') {
    delay(PAUSA_PALABRA);
    return;
  }

  letra = toupper(letra);
  if (letra < 'A' || letra > 'Z') return;         // ignora todo lo que no sea letra

  const char* codigo = MORSE[letra - 'A'];
  for (byte i = 0; codigo[i] != '\0'; i++) {
    pulso(codigo[i] == '.' ? PUNTO : RAYA);
  }
  delay(PAUSA_LETRA);
}

void emitirTexto(const char* texto) {
  for (byte i = 0; texto[i] != '\0'; i++) {
    emitirLetra(texto[i]);
  }
}

// ---------- Diagnóstico ----------
// Al encender, los 8 LEDs se prenden 1 segundo: sirve para revisar el cableado
void autoprueba() {
  encenderLeds(true);
  delay(1000);
  encenderLeds(false);
}

// El LED integrado "L" parpadea 2 veces cuando llega una palabra
void avisarRecepcion() {
  for (byte i = 0; i < 2; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
  }
}

// ---------- Programa principal ----------
void setup() {
  tira.begin();
  tira.setBrightness(BRILLO);
  tira.clear();
  tira.show();

  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.setTimeout(100);

  autoprueba();
}

void loop() {
  char texto[MAX_TEXTO + 1];
  int largo = Serial.readBytesUntil('\n', texto, MAX_TEXTO);

  if (largo > 0) {
    texto[largo] = '\0';
    avisarRecepcion();
    emitirTexto(texto);
  }
}
