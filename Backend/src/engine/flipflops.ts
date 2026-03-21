export type LogicState = 0 | 1;

export interface FlipFlopState {
  id: string;
  type: 'D' | 'JK' | 'T';
  q: LogicState;
  qNot: LogicState;
}

export abstract class FlipFlop {
  id: string;
  q: LogicState;
  qNot: LogicState;

  constructor(id: string, initialQ: LogicState = 0) {
    this.id = id;
    this.q = initialQ;
    this.qNot = initialQ === 0 ? 1 : 0;
  }

  abstract process(clock: LogicState, ...inputs: LogicState[]): void;

  protected updateState(newQ: LogicState) {
    this.q = newQ;
    this.qNot = newQ === 0 ? 1 : 0;
  }

  getState(): FlipFlopState {
    return {
      id: this.id,
      type: this.getType(),
      q: this.q,
      qNot: this.qNot
    };
  }

  abstract getType(): 'D' | 'JK' | 'T';
}

export class DFlipFlop extends FlipFlop {
  private lastClock: LogicState = 0;

  process(clock: LogicState, d: LogicState): void {
    // positive edge-triggered
    if (this.lastClock === 0 && clock === 1) {
      this.updateState(d);
    }
    this.lastClock = clock;
  }

  getType(): 'D' { return 'D'; }
}

export class JKFlipFlop extends FlipFlop {
  private lastClock: LogicState = 0;

  process(clock: LogicState, j: LogicState, k: LogicState): void {
    if (this.lastClock === 0 && clock === 1) {
      if (j === 0 && k === 0) {
        // No change
      } else if (j === 0 && k === 1) {
        this.updateState(0);
      } else if (j === 1 && k === 0) {
        this.updateState(1);
      } else if (j === 1 && k === 1) {
        this.updateState(this.qNot); // Toggle
      }
    }
    this.lastClock = clock;
  }

  getType(): 'JK' { return 'JK'; }
}

export class TFlipFlop extends FlipFlop {
  private lastClock: LogicState = 0;

  process(clock: LogicState, t: LogicState): void {
    if (this.lastClock === 0 && clock === 1) {
      if (t === 1) {
        this.updateState(this.qNot);
      }
    }
    this.lastClock = clock;
  }

  getType(): 'T' { return 'T'; }
}
