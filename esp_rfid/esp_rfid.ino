#include<Wire.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
//Configuration LCD
#define LCD_COLUMNS 16
#define LCD_ROWS 2
LiquidCrystal_I2C lcd(0x27, LCD_COLUMNS, LCD_ROWS);
// RFID config
#define SS_PIN 5
#define RST_PIN 22
MFRC522 mfrc522(SS_PIN, RST_PIN);

int compteur = 0;
void setup() {
  Serial.begin(115200);
  SPI.begin();
  delay(1000);
  // RFID init
  mfrc522.PCD_Init();
  // LCD init
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Systeme RFID");
  Serial.println("Système pret");
  lcd.clear();  

}

void loop() {
   // Vérifie carte
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  // Lire UID
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  compteur++;
  Serial.println("Carte detectee: " + uid);
  // Affichage LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("UID:");
  lcd.setCursor(0, 1);
  lcd.print(uid);

  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Total scans:");
  lcd.setCursor(0, 1);
  lcd.print(compteur);

  delay(2000);




  Serial.println("ça marche vraiment");
  delay(1000);
  

}
