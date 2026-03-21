import { DFlipFlop, JKFlipFlop, TFlipFlop } from '../flipflops';
import { ShiftRegister, RingCounter, JohnsonCounter } from '../circuits';

describe('Flip-Flop Logic', () => {
  it('D Flip-Flop updates on positive clock edge', () => {
    const dff = new DFlipFlop('D1');
    dff.process(0, 1); // clock 0, d 1 -> no change
    expect(dff.q).toBe(0);
    expect(dff.qNot).toBe(1);

    dff.process(1, 1); // clock 1 (positive edge), d 1 -> update 1
    expect(dff.q).toBe(1);
    expect(dff.qNot).toBe(0);

    dff.process(1, 0); // clock stays 1, d 0 -> no change
    expect(dff.q).toBe(1);

    dff.process(0, 0); // clock 0 -> no change
    dff.process(1, 0); // clock 1 (positive edge) -> update 0
    expect(dff.q).toBe(0);
  });

  it('JK Flip-Flop toggles when J=1, K=1', () => {
    const jk = new JKFlipFlop('JK1');
    jk.process(1, 1, 1); // initial edge
    expect(jk.q).toBe(1);
    jk.process(0, 1, 1);
    jk.process(1, 1, 1); // toggle
    expect(jk.q).toBe(0);
  });

  it('T Flip-Flop toggles when T=1', () => {
      const t = new TFlipFlop('T1');
      t.process(1, 1);
      expect(t.q).toBe(1);
      t.process(0, 1);
      t.process(1, 1);
      expect(t.q).toBe(0);
  });
});

describe('Circuit Logic', () => {
  it('Shift Register shifts bits correctly', () => {
    const sr = new ShiftRegister(4);
    // initial state: 0000
    let states = sr.runBatch(1, [1]); // Input 1
    let finalState = states[states.length - 1];
    expect(finalState.flipFlops.map(ff => ff.q)).toEqual([1, 0, 0, 0]);

    states = sr.runBatch(1, [0]); // Input 0
    finalState = states[states.length - 1];
    expect(finalState.flipFlops.map(ff => ff.q)).toEqual([0, 1, 0, 0]);
  });

  it('Ring Counter loops correctly', () => {
    const rc = new RingCounter(4);
    // initial state: 1000
    expect(rc.getState().flipFlops.map(ff => ff.q)).toEqual([1, 0, 0, 0]);
    
    let states = rc.runBatch(1);
    expect(states[states.length - 1].flipFlops.map(ff => ff.q)).toEqual([0, 1, 0, 0]);
    
    states = rc.runBatch(3);
    // Should loop back to 1000
    expect(states[states.length - 1].flipFlops.map(ff => ff.q)).toEqual([1, 0, 0, 0]);
  });

  it('Johnson Counter loops correctly', () => {
    const jc = new JohnsonCounter(4);
    // initial: 0000 -> 1000 -> 1100 -> 1110 -> 1111 -> 0111 -> 0011 -> 0001 -> 0000
    const sequence = [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
      [0, 0, 0, 0]
    ];
    
    for (let expected of sequence) {
       const states = jc.runBatch(1);
       expect(states[states.length - 1].flipFlops.map(ff => ff.q)).toEqual(expected);
    }
  });
});
