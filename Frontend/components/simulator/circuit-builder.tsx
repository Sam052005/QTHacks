'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Clock, Circle, Cpu, TriangleAlert, Minus, CircleDot, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore, type CircuitType } from '@/lib/simulation-store'
import { detectCircuitFromGraph } from '@/lib/detect-circuit'

// Custom Node Components
function ClockNode({ data }: { data: any }) {
  const isActive = data.active
  return (
    <div className={`rounded-lg border-2 bg-card px-4 py-3 transition-all shadow-lg ${isActive ? 'border-orange-400 shadow-orange-500/40 bg-orange-500/10' : 'border-orange-500/50 shadow-orange-500/10'}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${isActive ? 'text-orange-400 animate-pulse' : 'text-orange-600'}`} />
        <span className="text-sm font-bold text-foreground">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500" />
    </div>
  )
}

function InputNode({ data }: { data: any }) {
  const isActive = data.active
  const { toggleInputBit } = useSimulationStore()
  
  return (
    <div 
      onClick={() => toggleInputBit()}
      className={`rounded-lg border-2 bg-card px-4 py-3 transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95 group ${isActive ? 'border-yellow-400 shadow-yellow-500/40 bg-yellow-500/10' : 'border-yellow-500/50 shadow-yellow-500/10'}`}
    >
      <div className="flex items-center gap-2">
        <Circle className={`h-5 w-5 transition-transform group-hover:rotate-12 ${isActive ? 'text-yellow-400 fill-yellow-400/20' : 'text-yellow-600'}`} />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input Source</span>
          <span className="text-sm font-bold text-foreground">
            {data.label} <span className="ml-1 font-mono text-yellow-500">{isActive ? '1' : '0'}</span>
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground italic text-center opacity-0 group-hover:opacity-100 transition-opacity">
        Click to toggle
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-yellow-500 !bg-yellow-500" />
    </div>
  )
}

function DFlipFlopNode({ data }: { data: any }) {
  const qOn = data.q === true
  const qBarOn = data.qBar === true
  return (
    <div className={`rounded-lg border-2 bg-card px-4 py-3 transition-all shadow-lg min-w-[120px] ${qOn ? 'border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-green-500/40'}`}>
      <Handle type="target" position={Position.Left} id="d" style={{ top: '30%' }} className="!h-3 !w-3 !border-2 !border-green-500 !bg-green-500" />
      <Handle type="target" position={Position.Left} id="clk" style={{ top: '70%' }} className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500" />
      <div className="flex items-center justify-center gap-2 mb-2">
        <Cpu className={`h-5 w-5 ${qOn ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'text-green-600'}`} />
        <span className="text-sm font-bold text-foreground">{data.label}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">D</span>
        <span className={qOn ? 'text-green-400' : 'text-muted-foreground'}>{data.q !== undefined ? (qOn ? '1' : '0') : 'Q'}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">CLK</span>
        <span className={qBarOn ? 'text-blue-400' : 'text-muted-foreground'}>{data.qBar !== undefined ? (qBarOn ? '1' : '0') : 'Q̅'}</span>
      </div>
      <Handle type="source" position={Position.Right} id="q" style={{ top: '30%' }} className={`!h-3 !w-3 !border-2 ${qOn ? '!border-green-400 !bg-green-400 shadow-[0_0_10px_#4ade80]' : '!border-green-500/50 !bg-green-500/50'}`} />
      <Handle type="source" position={Position.Right} id="qbar" style={{ top: '70%' }} className={`!h-3 !w-3 !border-2 ${qBarOn ? '!border-blue-400 !bg-blue-400 shadow-[0_0_10px_#60a5fa]' : '!border-blue-500/50 !bg-blue-500/50'}`} />
    </div>
  )
}

function JKFlipFlopNode({ data }: { data: any }) {
  const qOn = data.q === true
  const qBarOn = data.qBar === true
  return (
    <div className={`rounded-lg border-2 bg-card px-4 py-3 transition-all shadow-lg min-w-[120px] ${qOn ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-purple-500/40'}`}>
      <Handle type="target" position={Position.Left} id="j" style={{ top: '25%' }} className="!h-3 !w-3 !border-2 !border-purple-500 !bg-purple-500" />
      <Handle type="target" position={Position.Left} id="clk" style={{ top: '50%' }} className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500" />
      <Handle type="target" position={Position.Left} id="k" style={{ top: '75%' }} className="!h-3 !w-3 !border-2 !border-purple-500 !bg-purple-500" />
      <div className="flex items-center justify-center gap-2 mb-2">
        <Cpu className={`h-5 w-5 ${qOn ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-purple-600'}`} />
        <span className="text-sm font-bold text-foreground">{data.label}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">J</span>
        <span className={qOn ? 'text-purple-400' : 'text-muted-foreground'}>{data.q !== undefined ? (qOn ? '1' : '0') : 'Q'}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">CLK</span>
        <span></span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">K</span>
        <span className={qBarOn ? 'text-blue-400' : 'text-muted-foreground'}>{data.qBar !== undefined ? (qBarOn ? '1' : '0') : 'Q̅'}</span>
      </div>
      <Handle type="source" position={Position.Right} id="q" style={{ top: '30%' }} className={`!h-3 !w-3 !border-2 ${qOn ? '!border-purple-400 !bg-purple-400 shadow-[0_0_10px_#c084fc]' : '!border-purple-500/50 !bg-purple-500/50'}`} />
      <Handle type="source" position={Position.Right} id="qbar" style={{ top: '70%' }} className={`!h-3 !w-3 !border-2 ${qBarOn ? '!border-blue-400 !bg-blue-400 shadow-[0_0_10px_#60a5fa]' : '!border-blue-500/50 !bg-blue-500/50'}`} />
    </div>
  )
}

function TFlipFlopNode({ data }: { data: any }) {
  const qOn = data.q === true
  const qBarOn = data.qBar === true
  return (
    <div className={`rounded-lg border-2 bg-card px-4 py-3 transition-all shadow-lg min-w-[120px] ${qOn ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'border-cyan-500/40'}`}>
      <Handle type="target" position={Position.Left} id="t" style={{ top: '30%' }} className="!h-3 !w-3 !border-2 !border-cyan-500 !bg-cyan-500" />
      <Handle type="target" position={Position.Left} id="clk" style={{ top: '70%' }} className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500" />
      <div className="flex items-center justify-center gap-2 mb-2">
        <Cpu className={`h-5 w-5 ${qOn ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-cyan-600'}`} />
        <span className="text-sm font-bold text-foreground">{data.label}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">T</span>
        <span className={qOn ? 'text-cyan-400' : 'text-muted-foreground'}>{data.q !== undefined ? (qOn ? '1' : '0') : 'Q'}</span>
      </div>
      <div className="flex justify-between text-xs font-black">
        <span className="text-muted-foreground/70">CLK</span>
        <span className={qBarOn ? 'text-blue-400' : 'text-muted-foreground'}>{data.qBar !== undefined ? (qBarOn ? '1' : '0') : 'Q̅'}</span>
      </div>
      <Handle type="source" position={Position.Right} id="q" style={{ top: '30%' }} className={`!h-3 !w-3 !border-2 ${qOn ? '!border-cyan-400 !bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : '!border-cyan-500/50 !bg-cyan-500/50'}`} />
      <Handle type="source" position={Position.Right} id="qbar" style={{ top: '70%' }} className={`!h-3 !w-3 !border-2 ${qBarOn ? '!border-blue-400 !bg-blue-400 shadow-[0_0_10px_#60a5fa]' : '!border-blue-500/50 !bg-blue-500/50'}`} />
    </div>
  )
}

function AndGateNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-pink-500 bg-card px-4 py-3 shadow-lg shadow-pink-500/20">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="a"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-pink-500 !bg-pink-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="b"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-pink-500 !bg-pink-500"
      />
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-pink-500">&amp;</span>
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-pink-500 !bg-pink-500"
      />
    </div>
  )
}

function OrGateNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-amber-500 bg-card px-4 py-3 shadow-lg shadow-amber-500/20">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="a"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-amber-500 !bg-amber-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="b"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-amber-500 !bg-amber-500"
      />
      <div className="flex items-center gap-2">
        <TriangleAlert className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-amber-500 !bg-amber-500"
      />
    </div>
  )
}

function NotGateNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-red-500 bg-card px-4 py-3 shadow-lg shadow-red-500/20">
      <Handle 
        type="target" 
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-red-500"
      />
      <div className="flex items-center gap-2">
        <Minus className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-red-500"
      />
    </div>
  )
}

function OutputNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-blue-500 bg-card px-4 py-3 shadow-lg shadow-blue-500/20">
      <Handle 
        type="target" 
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-500"
      />
      <div className="flex items-center gap-2">
        <CircleDot className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  clock: ClockNode,
  input: InputNode,
  dFlipFlop: DFlipFlopNode,
  jkFlipFlop: JKFlipFlopNode,
  tFlipFlop: TFlipFlopNode,
  andGate: AndGateNode,
  orGate: OrGateNode,
  notGate: NotGateNode,
  output: OutputNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const componentsList = [
  { type: 'clock', label: 'Clock', color: 'orange' },
  { type: 'input', label: 'Input Source', color: 'yellow' },
  { type: 'dFlipFlop', label: 'D Flip-Flop', color: 'green' },
  { type: 'jkFlipFlop', label: 'JK Flip-Flop', color: 'purple' },
  { type: 'tFlipFlop', label: 'T Flip-Flop', color: 'cyan' },
  { type: 'andGate', label: 'AND Gate', color: 'pink' },
  { type: 'orGate', label: 'OR Gate', color: 'amber' },
  { type: 'notGate', label: 'NOT Gate', color: 'red' },
  { type: 'output', label: 'Output Probe', color: 'blue' },
]

export function CircuitBuilder() {
  return (
    <ReactFlowProvider>
      <CircuitBuilderInternal />
    </ReactFlowProvider>
  )
}

function CircuitBuilderInternal() {
  const [snapToGrid, setSnapToGrid] = useState(true)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  
  const toggleSnap = useCallback(() => setSnapToGrid(s => !s), [])
  
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges,
    setCircuitType, 
    setNumFlipFlops, 
    flipFlops, 
    currentCycle, 
    isRunning,
    circuitType: currentCircuitType,
    numFlipFlops: currentNumFlipFlops 
  } = useSimulationStore()

  // Define reactivity handlers for ReactFlow
  const onNodesChange = useCallback(
    (changes: any) => {
      // Manual changes from UI
      import('@xyflow/react').then(({ applyNodeChanges }) => {
        const nextNodes = applyNodeChanges(changes, nodes)
        setNodes(nextNodes)
      })
    },
    [nodes, setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: any) => {
      import('@xyflow/react').then(({ applyEdgeChanges }) => {
        const nextEdges = applyEdgeChanges(changes, edges)
        setEdges(nextEdges)
      })
    },
    [edges, setEdges]
  )

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/label', label)
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      const label = event.dataTransfer.getData('application/label')

      if (!type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes]
  )


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: isRunning }, eds)),
    [setEdges, isRunning]
  )

  // Sync simulation data back to nodes for live visualization
  useEffect(() => {
    setNodes((nds) => {
      const ffNodes = nds.filter(n => ['dFlipFlop', 'jkFlipFlop', 'tFlipFlop'].includes(n.type as string))
      // Sort left-to-right to match backend array order assumption for standard circuits
      const sortedFFs = [...ffNodes].sort((a, b) => a.position.x - b.position.x)
      
      return nds.map(n => {
        if (n.type === 'clock') {
          return { ...n, data: { ...n.data, active: isRunning && currentCycle % 2 === 1 } }
        }
        if (n.type === 'input') {
          return { ...n, data: { ...n.data, active: isRunning && currentCycle > 0 } }
        }
        if (['dFlipFlop', 'jkFlipFlop', 'tFlipFlop'].includes(n.type as string)) {
          const idx = sortedFFs.findIndex(ff => ff.id === n.id)
          const state = flipFlops[idx]
          if (state) {
            return { ...n, data: { ...n.data, q: state.q, qBar: state.qBar } }
          }
        }
        return n
      })
    })
  }, [flipFlops, currentCycle, isRunning, setNodes])

  // Sync edge animation based on simulation run state
  useEffect(() => {
    setEdges((eds) => eds.map(e => ({ ...e, animated: isRunning })))
  }, [isRunning, setEdges])

  // Sync with store detection
  useEffect(() => {
    // Only detect if it's not empty
    if (nodes.length === 0) return

    const circuitStr = detectCircuitFromGraph(nodes, edges)
    const numMatch = circuitStr.match(/^(\d+)-bit/)
    
    if (numMatch) {
      const num = parseInt(numMatch[1])
      if (num !== currentNumFlipFlops) {
        setNumFlipFlops(num)
      }
      
      const typePart = circuitStr.replace(/^\d+-bit /, '')
      let targetType: CircuitType = 'Shift Register'
      
      if (typePart.includes('Custom')) {
        if (circuitStr.includes('Shift')) targetType = 'Shift Register'
        else if (circuitStr.includes('Ring')) targetType = 'Ring Counter'
        else if (circuitStr.includes('Johnson')) targetType = 'Johnson Counter'
        else targetType = 'D Flip-Flop'
      } else {
        targetType = typePart as CircuitType
      }
      
      if (targetType !== currentCircuitType) {
        setCircuitType(targetType)
      }
    }
  }, [nodes, edges]) // Shorter dependency list to avoid infinite loops

  const addNode = useCallback((type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label },
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => !e.selected))
  }, [setNodes, setEdges])

  return (
    <div className="flex h-full">
      {/* Component Palette */}
      <div className="w-56 border-r border-border bg-card p-4 overflow-y-auto">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Components</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Click to add components to the canvas. Connect them by dragging from handles.
        </p>
        <div className="space-y-2">
          {componentsList.map((comp) => (
            <div
              key={comp.type}
              draggable
              onDragStart={(event) => onDragStart(event, comp.type, comp.label)}
              className={`w-full cursor-grab active:cursor-grabbing rounded-md border border-${comp.color}-500/50 bg-secondary/50 px-3 py-2 text-left text-sm text-foreground transition-all hover:bg-${comp.color}-500/20 hover:border-${comp.color}-500 hover:scale-[1.02] shadow-sm`}
            >
              {comp.label}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full gap-2" 
            onClick={deleteSelected}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
        
        <div className="mt-6 rounded-md border border-border bg-secondary/30 p-3">
          <h4 className="text-xs font-medium text-foreground mb-2">Circuit Data</h4>
          <p className="text-xs text-muted-foreground">
            Nodes: <span className="font-mono text-primary">{nodes.length}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Edges: <span className="font-mono text-primary">{edges.length}</span>
          </p>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1 relative group" ref={reactFlowWrapper}>
        {/* Grid Snap Toggle Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-secondary/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-secondary">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Snap to Grid</span>
          <button 
            onClick={toggleSnap}
            className={`w-9 h-5 rounded-full relative transition-all duration-300 ${snapToGrid ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${snapToGrid ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          className="bg-[#0a0f1a] focus:outline-none"
          colorMode="dark"
        >
          <Background color="#334155" gap={20} />
          <Controls className="!bg-card !border-border !rounded-lg" />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'clock': return '#f97316'
                case 'input': return '#eab308'
                case 'dFlipFlop': return '#22c55e'
                case 'jkFlipFlop': return '#a855f7'
                case 'tFlipFlop': return '#06b6d4'
                case 'andGate': return '#ec4899'
                case 'orGate': return '#f59e0b'
                case 'notGate': return '#ef4444'
                case 'output': return '#3b82f6'
                default: return '#64748b'
              }
            }}
            style={{ width: 140, height: 105 }}
            className="!bg-card !border-border !rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
