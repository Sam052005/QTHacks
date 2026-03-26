import { Play, Pause, SkipForward, RotateCcw, Cpu, Wrench, Brain, User as UserIcon, Atom, Download, Bug, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useSimulationStore, CircuitType } from '@/lib/simulation-store'
import { useAuthStore } from '@/lib/auth-store'
import { generateVerilog, downloadVerilog } from '@/utils/export-verilog'

const circuitTypes: CircuitType[] = [
  'D Flip-Flop',
  'JK Flip-Flop',
  'T Flip-Flop',
  'Shift Register',
  'Ring Counter',
  'Johnson Counter',
]

interface NavigationBarProps {
  onDebugClick?: () => void
  isChallengeMode?: boolean
}

export function NavigationBar({ onDebugClick, isChallengeMode = false }: NavigationBarProps) {
  const {
    circuitType,
    numFlipFlops,
    clockFrequency,
    isRunning,
    isPaused,
    viewMode,
    quantumMode,
    setCircuitType,
    setClockFrequency,
    setViewMode,
    startSimulation,
    pauseSimulation,
    stepClock,
    resetSimulation,
    toggleQuantumMode,
  } = useSimulationStore()
  
  const { user } = useAuthStore()
  const router = useRouter()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-2 overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center min-w-[40px]">
          <Image 
            src="/Logo.jpeg" 
            alt="Logo" 
            width={120} 
            height={36} 
            className="h-8 w-auto object-contain cursor-default"
            priority
          />
        </div>
        {isChallengeMode && (
          <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
            <Trophy className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Challenge Mode</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Simulation Controls */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <Button
            size="sm"
            variant={isRunning && !isPaused ? 'default' : 'ghost'}
            onClick={startSimulation}
            className="h-8 w-8 p-0"
            title="Start Simulation"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={isPaused ? 'default' : 'ghost'}
            onClick={pauseSimulation}
            disabled={!isRunning}
            className="h-8 w-8 p-0"
            title="Pause Simulation"
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={stepClock}
            className="h-8 w-8 p-0"
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetSimulation}
            className="h-8 w-8 p-0"
            title="Reset Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Circuit Selector */}
        <Select value={circuitType} onValueChange={(v) => setCircuitType(v as CircuitType)}>
          <SelectTrigger className="w-[130px] h-8 bg-secondary/50 px-2 text-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {circuitTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-xs">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clock Frequency */}
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 py-1">
          <Slider
            value={[clockFrequency]}
            onValueChange={([v]) => setClockFrequency(v)}
            min={0.5}
            max={5}
            step={0.5}
            className="w-16"
          />
          <span className="text-[10px] font-mono text-foreground w-8">{clockFrequency}Hz</span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <Button
            size="sm"
            variant={viewMode === 'simulator' ? 'default' : 'ghost'}
            onClick={() => setViewMode('simulator')}
            className="h-8 w-8 p-0"
            title="Simulator View"
          >
            <Cpu className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'builder' ? 'default' : 'ghost'}
            onClick={() => setViewMode('builder')}
            className="h-8 w-8 p-0"
            title="Builder View"
          >
            <Wrench className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Debug Panel Toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={onDebugClick}
          className="h-8 w-8 lg:w-auto lg:px-3 p-0 gap-1.5"
          title="AI Debug"
        >
          <Brain className="h-4 w-4" />
          <span className="hidden lg:inline">Debug</span>
        </Button>

        {/* Verilog Export */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 min-[1150px]:w-auto min-[1150px]:px-3 p-0 gap-1.5 border-green-500/40 hover:border-green-500 hover:bg-green-500/10 text-green-400"
          onClick={() => {
            const code = generateVerilog(circuitType, numFlipFlops)
            const fname = `${circuitType.replace(/\s+/g, '_').toLowerCase()}_${numFlipFlops}bit.v`
            downloadVerilog(code, fname)
          }}
          title="Export Verilog"
        >
          <Download className="h-4 w-4" />
          <span className="hidden min-[1150px]:inline">Export .v</span>
        </Button>

        {/* Quantum Mode Toggle */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <Button
            size="sm"
            variant={!quantumMode ? 'default' : 'ghost'}
            onClick={() => quantumMode && toggleQuantumMode()}
            className="h-8 px-2 text-[10px]"
            title="Classical Mode"
          >
            <Cpu className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Classical</span>
          </Button>
          <Button
            size="sm"
            variant={quantumMode ? 'default' : 'ghost'}
            onClick={() => !quantumMode && toggleQuantumMode()}
            className={`h-8 px-2 text-[10px] ${
              quantumMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
            }`}
            title="Quantum Mode"
          >
            <Atom className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Quantum</span>
          </Button>
        </div>

        {/* Hardware Mode Toggle */}


        {/* Auth Section */}
        <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
          {user ? (
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-2"
              onClick={() => router.push('/profile')}
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden md:inline font-medium">{user.username}</span>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push('/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

    </header>
  )
}
