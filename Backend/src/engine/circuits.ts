import { FlipFlop, DFlipFlop } from './flipflops.js';
import type { LogicState, FlipFlopState } from './flipflops.js';

export type CircuitType = 'SHIFT_REGISTER' | 'RING_COUNTER' | 'JOHNSON_COUNTER';

export interface CircuitState {
  cycle: number;
  clock: LogicState;
  input: LogicState;
  flipFlops: FlipFlopState[];
}

export abstract class SequentialCircuit {
  protected flipFlops: FlipFlop[] = [];
  protected cycleCount: number = 0;
  protected currentClock: LogicState = 0;

  constructor(public size: number) {
    this.initialize();
  }

  protected abstract initialize(): void;
  
  // Step simulation by half a clock cycle (high/low transition)
  abstract step(input?: LogicState): CircuitState;

  // Run a full clock cycle consisting of a high and low transition
  runCycle(input: LogicState = 0): CircuitState[] {
    const states: CircuitState[] = [];
    states.push(this.step(input)); // transition to 1 (or 0)
    states.push(this.step(input)); // transition to 0 (or 1)
    return states;
  }

  runBatch(cycles: number, inputs: LogicState[] = []): CircuitState[] {
    const history: CircuitState[] = [];
    for (let i = 0; i < cycles; i++) {
        const input = i < inputs.length ? inputs[i] : 0;
        const cycleStates = this.runCycle(input);
        history.push(...cycleStates);
    }
    return history;
  }

  getState(input: LogicState = 0): CircuitState {
      return {
          cycle: Math.floor(this.cycleCount / 2),
          clock: this.currentClock,
          input,
          flipFlops: this.flipFlops.map(ff => ff.getState())
      };
  }
}

export class ShiftRegister extends SequentialCircuit {
  protected initialize(): void {
    for (let i = 0; i < this.size; i++) {
      this.flipFlops.push(new DFlipFlop(`FF${i}`));
    }
  }

  step(input: LogicState = 0): CircuitState {
    this.currentClock = this.currentClock === 0 ? 1 : 0;
    
    // We must evaluate the inputs to all flip flops before applying the clock,
    // because processing updates state sequentially in software.
    // In hardware they evaluate simultaneously.
    const dInputs = [input, ...this.flipFlops.slice(0, -1).map(ff => ff.q)];
    
    this.flipFlops.forEach((ff, index) => {
        (ff as DFlipFlop).process(this.currentClock, dInputs[index]);
    });

    this.cycleCount++;
    return this.getState(input);
  }
}

export class RingCounter extends SequentialCircuit {
  protected initialize(): void {
    for (let i = 0; i < this.size; i++) {
      // Ring counter typically initializes with one FF at 1, others at 0
      this.flipFlops.push(new DFlipFlop(`FF${i}`, i === 0 ? 1 : 0));
    }
  }

  step(input: LogicState = 0): CircuitState {
    this.currentClock = this.currentClock === 0 ? 1 : 0;
    
    const lastQ = this.flipFlops[this.flipFlops.length - 1].q;
    const dInputs = [lastQ, ...this.flipFlops.slice(0, -1).map(ff => ff.q)];

    this.flipFlops.forEach((ff, index) => {
        (ff as DFlipFlop).process(this.currentClock, dInputs[index]);
    });

    this.cycleCount++;
    return this.getState(input);
  }
}

export class JohnsonCounter extends SequentialCircuit {
  protected initialize(): void {
    for (let i = 0; i < this.size; i++) {
      this.flipFlops.push(new DFlipFlop(`FF${i}`, 0));
    }
  }

  step(input: LogicState = 0): CircuitState {
    this.currentClock = this.currentClock === 0 ? 1 : 0;
    
    const lastQNot = this.flipFlops[this.flipFlops.length - 1].qNot;
    const dInputs = [lastQNot, ...this.flipFlops.slice(0, -1).map(ff => ff.q)];

    this.flipFlops.forEach((ff, index) => {
        (ff as DFlipFlop).process(this.currentClock, dInputs[index]);
    });

    this.cycleCount++;
    return this.getState(input);
  }
}
