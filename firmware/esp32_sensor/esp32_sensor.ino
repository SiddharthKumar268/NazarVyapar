// firmware/esp32_sensor.ino
// NazarVyapar — Retail Footfall Analyzer
// Hardware: ESP32 + PIR (GPIO 13) + LDR (GPIO 34)
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── CONFIG ──
const char* ssid     = "Longclaw";
const char* password = "Siddharth241";
const char* endpoint = "http://192.168.29.151:5000/api/footfall/log";
// ── PINS ──
#define PIR_PIN  13    // PIR OUT → GPIO 13
#define LDR_PIN  34    // LDR → GPIO 34 (analog input)

// ── STATE ──
bool lastPIR    = LOW;
bool currentPIR = LOW;

// ── SETUP ──
void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

// ── LOOP ──
void loop() {
  currentPIR = digitalRead(PIR_PIN);

  // trigger only on RISING edge — person just entered
  if (currentPIR == HIGH && lastPIR == LOW) {
    int lightVal = analogRead(LDR_PIN);   // 0–4095 on ESP32
    Serial.println("Person detected! Light: " + String(lightVal));
    sendEntry(1, lightVal);
    delay(2000);   // debounce — ignore next 2s
  }

  lastPIR = currentPIR;
  delay(100);
}

// ── HTTP POST ──
void sendEntry(int count, int light) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Skipping POST.");
    return;
  }

  HTTPClient http;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["count"] = count;
  doc["light"] = light;

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);

  if (code == 201) {
    Serial.println("Logged successfully. HTTP 201");
  } else {
    Serial.println("POST failed. Code: " + String(code));
  }

  http.end();
}