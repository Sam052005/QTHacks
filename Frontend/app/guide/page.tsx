'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Boxes, Layout, Zap, Cpu, Atom, Bot, ChevronRight, Check } from 'lucide-react'

export default function GuidePage() {
  const router = useRouter()

  const guideItems = [
    {
      title: "3D Simulator",
      desc: "Experience your logic circuits in a high-fidelity 3D environment with real-time signal visualization.",
      icon: Boxes,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      steps: [
        "Drag components from the top component tray into the 3D scene.",
        "Click on components to toggle their physical state (e.g., Input Blocks).",
        "Use your mouse to rotate (Left Click) and zoom (Scroll) around the circuit.",
        "Observe the glowing pulses to trace logic propagation through the circuit."
      ],
      tip: "Physical blocks turn bright blue for Logic 1 and dark for Logic 0."
    },
    {
      title: "Logic Builder",
      desc: "A powerful 2D node-based canvas to design, connect, and customize complex logic topologies.",
      icon: Layout,
      color: "text-green-400",
      bg: "bg-green-500/10",
      steps: [
        "Use the search bar on the left to find Gates, Flip-Flops, or Clocks.",
        "Drag a component onto the canvas to place it.",
        "Click and drag from one node port to another to create a logic wire.",
        "Right-click on any wire or node to delete it instantly."
      ],
      tip: "Use the 'Auto-Layout' button to clean up messy wiring diagrams."
    },
    {
      title: "Guided Challenges",
      desc: "Learn sequential logic step-by-step with puzzles that offer real-time grading and Verilog hints.",
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      steps: [
        "Select a challenge (e.g., '3-Bit Counter') from the challenge dashboard.",
        "Review the target Truth Table or Waveform in the collapsible panel.",
        "Construct the logic to match the required output using available gates.",
        "Run the automated testbench to verify your design and earn a score."
      ],
      tip: "100% score is required to unlock advanced sequential logic levels."
    },
    {
      title: "Hardware Sync",
      desc: "Connect physical Arduino kits via Web Serial to sync your virtual designs with real hardware.",
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      steps: [
        "Connect your simulator-compatible Arduino via USB.",
        "Click the 'Hardware Sync' button in the main navigation bar.",
        "Select your device from the browser's serial port list.",
        "Virtual inputs will now control physical LEDs, and real buttons will trigger virtual gates."
      ],
      tip: "Ensure your board is flashed with the 'QTHacks Firmware' v1.2+."
    },
    {
      title: "Quantum Engine",
      desc: "Switch to Quantum Mode to simulate qubits, observe Bloch Spheres, and apply quantum gates.",
      icon: Atom,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      steps: [
        "Open the Settings Drawer and toggle on 'Quantum Engine Mode'.",
        "Place Qubit nodes and observe their Bloch Sphere probabilities.",
        "Apply H (Hadamard), X, Y, or Z gates to modify the qubit state.",
        "Use 'Measure' blocks to collapse the wavefunction into classical bits."
      ],
      tip: "A Hadamard (H) gate puts a qubit into a 50/50 superposition state."
    },
    {
      title: "AI Debugger",
      desc: "Use the built-in Intelligent Assistant to troubleshoot circuits and get automated design help.",
      icon: Bot,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      steps: [
        "Press 'D' on your keyboard or click the AI icon to open the chat debug panel.",
        "Ask questions like 'Why is my counter not incrementing?'",
        "The AI will scan your current circuit graph and highlight logic errors.",
        "Follow the AI's step-by-step suggestions to fix timing or wiring issues."
      ],
      tip: "The AI agent can also auto-generate complex circuits from text prompts."
    }
  ]

  return (
    <div className="min-h-screen bg-background p-8 pt-24 pb-32">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16">
        <Button 
          variant="ghost" 
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground mb-4"
          onClick={() => router.push('/profile')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Button>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">Feature Manual</h1>
        <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
          Everything you need to know about designing, simulating, and debugging in our digital ecosystem.
        </p>
      </div>

      {/* Manual Content */}
      <div className="max-w-6xl mx-auto space-y-20">
        {guideItems.map((item, idx) => (
          <div 
            key={idx}
            className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 border-b border-border pb-20 last:border-0"
          >
            {/* Left: Info */}
            <div className="space-y-6">
              <div className={`inline-flex items-center justify-center p-5 rounded-3xl ${item.bg} ${item.color}`}>
                <item.icon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">{item.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-secondary/50">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Pro Tip</p>
                <p className="text-sm italic text-foreground/80">{item.tip}</p>
              </div>
            </div>

            {/* Right: Steps */}
            <div className="bg-card/40 rounded-3xl border border-border p-8 lg:p-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                  {idx + 1}
                </span>
                How to use it:
              </h3>
              <div className="space-y-6">
                {item.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-primary/30 flex items-center justify-center mt-1 group-hover:bg-primary/10 transition-colors">
                      <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg text-foreground group-hover:translate-x-1 transition-transform">{step}</p>
                      <div className="h-0.5 w-0 bg-primary/20 group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcuts Shortcut */}
      <div className="max-w-4xl mx-auto mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-4 mb-8 text-primary">
          <Zap className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Platform Shortcuts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
            <span className="text-muted-foreground">Toggle AI Chat</span>
            <kbd className="px-3 py-1 bg-muted rounded-md text-sm font-bold border-b-4 border-muted-foreground/30">D</kbd>
          </div>
          <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
            <span className="text-muted-foreground">Play/Pause Simulation</span>
            <kbd className="px-3 py-1 bg-muted rounded-md text-sm font-bold border-b-4 border-muted-foreground/30">Space</kbd>
          </div>
          <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
            <span className="text-muted-foreground">Search Component</span>
            <kbd className="px-3 py-1 bg-muted rounded-md text-sm font-bold border-b-4 border-muted-foreground/30">/</kbd>
          </div>
          <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
            <span className="text-muted-foreground">Undo Last Action</span>
            <kbd className="px-3 py-1 bg-muted rounded-md text-sm font-bold border-b-4 border-muted-foreground/30">Ctrl + Z</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
