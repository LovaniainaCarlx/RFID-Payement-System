/*#include <SPI.h>
#include <MFRC522.h>

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("=== RFID START ===");

  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();

  Serial.println("RFID INIT OK");

  // 🔍 TEST VERSION RFID
  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);

  Serial.print("Version RFID: 0x");
  Serial.println(version, HEX);

  if (version == 0x00 || version == 0xFF) {
    Serial.println("❌ RFID NON DETECTE");
  } else {
    Serial.println("✅ RFID OK");
  }

  Serial.println("Approche une carte...");
}

void loop() {

  // 🔍 lecture continue version (debug)
  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print("Version RFID (loop): 0x");
  Serial.println(version, HEX);

  delay(1000);

  // 🟢 DETECTION CARTE
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // 🎉 CARTE DETECTEE
  Serial.println("\n🎉 CARTE DETECTEE !");

  Serial.print("UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i], HEX);
    Serial.print(" ");
  }

  Serial.println();

  // arrêt propre communication
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(1500);
}*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// RFID pins
#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

// 🌐 WiFi
const char* ssid = "RDB";
const char* password = "*whenuseeuknoW";

// 🌐 Node.js API
const char* serverURL = "http://192.168.1.62:3000/api/scan";

void sendUID(String uid) {

  HTTPClient http;

  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"uid\":\"" + uid + "\"}";

  int response = http.POST(json);

  Serial.print("HTTP Response: ");
  Serial.println(response);

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("=== RFID NODE SYSTEM START ===");

  // WiFi connect
  WiFi.begin(ssid, password);

  Serial.print("Connexion WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté !");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());

  //RFID init
  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();

  Serial.println("RFID prêt - approche une carte...");
}

void loop() {

  // 🟢 DETECTION CARTE
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // 🎉 CARTE DETECTEE
  Serial.println("\n🎉 CARTE DETECTEE");

  String uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
    uid += " ";
  }

  uid.trim();

  Serial.print("UID: ");
  Serial.println(uid);

  //ENVOI NODE.JS
  sendUID(uid);

  // stop RFID session
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(1500);
}