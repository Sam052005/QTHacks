// Web Serial API Wrapper for Smart Flip-Flop Hardware

class SerialManager {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private keepReading = true;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  private receiveBuffer = '';
  
  // Callbacks
  private onStateUpdate: ((states: number[]) => void) | null = null;
  private onDisconnect: (() => void) | null = null;
  private onMessage: ((msg: any) => void) | null = null;

  setCallbacks({
    onStateUpdate,
    onDisconnect,
    onMessage
  }: {
    onStateUpdate?: (states: number[]) => void;
    onDisconnect?: () => void;
    onMessage?: (msg: any) => void;
  }) {
    if (onStateUpdate) this.onStateUpdate = onStateUpdate;
    if (onDisconnect) this.onDisconnect = onDisconnect;
    if (onMessage) this.onMessage = onMessage;
  }

  async connect(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        console.error('Web Serial API not supported in this browser.');
        return false;
      }
      
      // Request a port and open it
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 }); // Fast baud rate for sync
      
      this.writer = this.port.writable.getWriter();
      this.keepReading = true;
      
      // Start the read loop
      this.readLoop();
      
      // Listen for physical disconnects
      (navigator as any).serial.addEventListener('disconnect', (event: any) => {
        if (event.target === this.port) {
          this.handleDisconnect();
        }
      });

      return true;
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'AbortError') {
        console.log('Hardware connection cancelled by user.');
      } else {
        console.error('Failed to connect to hardware:', error);
      }
      return false;
    }
  }

  async disconnect() {
    this.keepReading = false;
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.writer) {
      this.writer.releaseLock();
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.handleDisconnect();
  }

  private handleDisconnect() {
    this.port = null;
    this.writer = null;
    this.reader = null;
    if (this.onDisconnect) this.onDisconnect();
  }

  async send(data: any) {
    if (!this.writer) return;
    try {
      const message = JSON.stringify(data) + '\n';
      const encoded = this.encoder.encode(message);
      await this.writer.write(encoded);
    } catch (error) {
      console.error('Failed to write to serial port:', error);
    }
  }

  private async readLoop() {
    while (this.port?.readable && this.keepReading) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          
          if (value) {
            this.receiveBuffer += this.decoder.decode(value, { stream: true });
            this.processBuffer();
          }
        }
      } catch (error) {
        console.error('Error reading from serial port:', error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  private processBuffer() {
    const lines = this.receiveBuffer.split('\n');
    this.receiveBuffer = lines.pop() || ''; // Keep incomplete line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      try {
        const payload = JSON.parse(trimmed);
        
        if (this.onMessage) this.onMessage(payload);

        if (payload.type === 'STATE_UPDATE' && payload.states) {
          if (this.onStateUpdate) this.onStateUpdate(payload.states);
        }
      } catch (error) {
        // Not JSON, ignore or log as simple string
        // console.log("HW Log: ", trimmed);
      }
    }
  }
}

export const serialManager = new SerialManager();
