#include "config.h"          


const int VRx = A2;   
const int VRy = A3;   
const int SW  = 14;   


AdafruitIO_Feed *joystick = io.feed("joystick");


const int ADC_BITS = 12;       
const int SEND_EVERY_MS = 2000;  

unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial) {;}

  pinMode(SW, INPUT_PULLUP);    
  analogReadResolution(ADC_BITS);
  analogSetAttenuation(ADC_11db); 


  Serial.print("Connecting to Adafruit IO");
  io.connect();
  while (io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.println(io.statusText());
}

void loop() {
  io.run(); 

  
  if (millis() - lastSend < SEND_EVERY_MS) return;
  lastSend = millis();

  int x = analogRead(VRx);        
  int y = analogRead(VRy);         
  bool pressed = (digitalRead(SW) == LOW);


  String payload = String(x) + "," + String(y) + "," + (pressed ? "1" : "0");

  Serial.println(payload);
  joystick->save(payload);
}
