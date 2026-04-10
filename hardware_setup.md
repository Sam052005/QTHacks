# 🎓 The Quantum Logic Hardware Edu-Kit

Welcome to the Hardware Integration Guide. This isn't just about wiring an ESP32 to your computer; it's about building a **Tactile Learning Lab**. 

Digital logic is often abstract. By pairing the **Virtual 3D Simulator** with a physical **Logic Trainer Board**, students can *touch* the clock pulses, *feel* the data inputs, and immediately see the results mirrored in the 3D software space.

---

## 🏗️ 1. Architecture Overview

To bridge the software and hardware, we use the modern **Web Serial API**. This allows your web browser to talk *directly* to the ESP32 over USB, completely bypassing the backend server!

`[Frontend (Next.js in Chrome/Edge)]` <--(Web Serial USB)--> `[ESP32 Microcontroller]` <--> `[Logic Trainer Board]`

- **Frontend**: The React application uses `navigator.serial` to open a direct port to the ESP32.
- **ESP32**: Runs C++ firmware (via the Arduino IDE) that listens for state updates (to toggle LEDs) and sends button presses (to trigger clock pulses).

---

## 🌟 2. The Learning Experience

**The Goal:** To bridge the gap between textbook truth tables and physical hardware reality.

When a student presses the physical "Clock" button on their desk:
1. They overcome the concept of switch bouncing (debouncing in hardware/firmware).
2. They see the physical LED light up on their breadboard.
3. They instantly see the 3D virtual flip-flop change state on their screen.
4. They watch the live timing diagram log their physical action.

---

## 🛠️ 3. The "Edu-Kit" Requirements

To build the "Logic Trainer Board", you'll need standard maker components, arranged to look like a professional learning kit.

### **The Brain**
- **ESP32 Development Board**: The brains of the operation (3.3V logic).

### **The Input Zone (The Control Panel)**
- **2x Arcade-Style or Large Tactile Pushbuttons**: One for `CLOCK` (Yellow), One for `DATA INPUT` (Blue).
- **2x 10kΩ Resistors**: For "Pull-down" networks.

### **The Output Zone (The Register)**
- **4x LEDs**: (Green or White) representing a 4-bit Register ($Q_0$ to $Q_3$).
- **4x 220Ω Resistors**: For current limiting.

### **The Canvas**
- **1x Large Breadboard**: Zone the board into "INPUTS" and "OUTPUT LATCHES".

---

## 🧱 4. Building the Logic Trainer Board

### **Step 1: The Input Zone (Left Side)**
*Learning Objective: Understanding Pull-Down Resistors.*

1. Connect one side of both buttons to the **3.3V** rail.
2. Connect the other side of the **CLOCK button** to **GPIO 25**.
3. To ensure the pin reads `0` when not pressed, connect a 10kΩ resistor from GPIO 25 to **GND**.
4. Repeat for the **DATA button**, connecting it to **GPIO 26** and GND with a 10kΩ resistor.

### **Step 2: The Output Zone (Right Side)**
*Learning Objective: Current limiting.*

1. Connect the long leg (Anode) of 4 LEDs to **GPIO 18, 19, 21, and 22**.
2. Connect a 220Ω resistor from the short leg (Cathode) of each LED to the **GND** rail.

---

## 💻 5. The Firmware: Teaching the ESP32

Upload this C++ code to the ESP32. Read through the comments—they are written to explain *why* the code acts the way it does.

```cpp
/**
 * Quantum Logic Hardware Sync
 * This script turns the ESP32 into a physical proxy for the 3D Simulator.
 */
#include <ArduinoJson.h> // Requires ArduinoJson library

// Output Logic Array
const int flipFlopPins[] = {18, 19, 21, 22}; 

// Input Controllers
const int clockPin = 25;
const int dataPin = 26;

int lastClockState = LOW;

void setup() {
  Serial.begin(115200); // Fast baud rate for Web Serial
  
  for (int i = 0; i < 4; i++) {
    pinMode(flipFlopPins[i], OUTPUT);
  }
  
  pinMode(clockPin, INPUT);
  pinMode(dataPin, INPUT);
}

void loop() {
  // ---------------------------------------------------------
  // 1. VISUALIZE: Read from Browser & Update Physical LEDs
  // ---------------------------------------------------------
  if (Serial.available() > 0) {
    String jsonString = Serial.readStringUntil('\n'); 
    
    // The browser sends JSON like: {"type":"STATE_UPDATE", "states":[1,0,1,0]}
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, jsonString);
    
    if (!error && doc["type"] == "STATE_UPDATE") {
      JsonArray states = doc["states"];
      for (int i = 0; i < 4 && i < states.size(); i++) {
        digitalWrite(flipFlopPins[i], states[i].as<int>() == 1 ? HIGH : LOW);
      }
    }
  }

  // ---------------------------------------------------------
  // 2. INTERACT: Read Human Input & Send to Browser
  // ---------------------------------------------------------
  int currentClock = digitalRead(clockPin);
  
  // RISING EDGE DETECTION
  if (currentClock != lastClockState && currentClock == HIGH) {
    int currentData = digitalRead(dataPin);
    
    // Send JSON to the Web Serial API
    Serial.print("{\"type\":\"CLOCK_PULSE\",\"inputs\":[");
    Serial.print(currentData);
    Serial.println("]}"); 
    
    delay(50); // DEBOUNCING
  }
  
  lastClockState = currentClock;
}
```

---

## ⚙️ 6. Software Integration: You are already done!

Here is the best part: **You do not need to write any backend or software code.** 

The Quantum Logic Simulator is already equipped with the **Web Serial API**. All the logic to talk to your ESP32 is built right into the frontend browser!

### How to Connect:
1. Plug your programmed ESP32 into your computer via USB.
2. Open the Simulator in a supported browser (Google Chrome or Microsoft Edge).
3. On the right-side control panel, find the **Hardware Kit** section.
4. Click **Connect Hardware USB**.
5. A browser popup will appear asking for permission to connect to a serial port. Select your ESP32 (usually labeled "CP210x" or "CH340" or "USB Serial").
6. Switch the toggle from **Sim** to **Real**.

When a student flips the physical switch on the Logic Trainer Board, the bits fly through USB directly into the browser memory, instantly animating the 3D models on their screen. **That is the "Aha!" moment of engineering.** 🚀
