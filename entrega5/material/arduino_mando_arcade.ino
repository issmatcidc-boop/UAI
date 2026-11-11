#include <Arduino.h>

// Mini arcade controller, identified by physical position (not button color):
// D2 = LEFT, D3 = RIGHT, D4 = UP, D5 = DOWN, D6 = RED; slider signal = A0.
// Serial protocol at 115200 baud, one CSV line every 20 ms:
// left,right,up,down,red,sliderPercent

const uint8_t BUTTON_COUNT = 5;
const uint8_t BUTTON_PINS[BUTTON_COUNT] = {2, 3, 4, 5, 6};
const uint8_t PIN_SLIDER = A0;
const unsigned long DEBOUNCE_MS = 25;
const unsigned long SEND_INTERVAL_MS = 20;

bool rawButtonState[BUTTON_COUNT];
bool stableButtonState[BUTTON_COUNT];
unsigned long lastButtonChangeAt[BUTTON_COUNT];
unsigned long lastSendAt = 0;

void setup() {
  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
    rawButtonState[i] = digitalRead(BUTTON_PINS[i]);
    stableButtonState[i] = rawButtonState[i];
    lastButtonChangeAt[i] = 0;
  }

  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();

  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    const bool reading = digitalRead(BUTTON_PINS[i]);

    if (reading != rawButtonState[i]) {
      rawButtonState[i] = reading;
      lastButtonChangeAt[i] = now;
    }

    if (now - lastButtonChangeAt[i] >= DEBOUNCE_MS) {
      stableButtonState[i] = rawButtonState[i];
    }
  }

  if (now - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = now;

    for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
      Serial.print(stableButtonState[i] == LOW ? 1 : 0);
      Serial.print(',');
    }

    // Direct, unfiltered slider reading scaled to 0-100.
    const int sliderPercent = map(analogRead(PIN_SLIDER), 0, 1023, 0, 100);
    Serial.println(sliderPercent);
  }
}
