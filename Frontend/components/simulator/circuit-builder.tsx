'use client'

import { useCallback, useState } from 'react'
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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Clock, Circle, Cpu, TriangleAlert, Minus, CircleDot } from 'lucide-react'

// Custom Node Components
function ClockNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-orange-500 bg-card px-4 py-3 shadow-lg shadow-orange-500/20">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500"
      />
    </div>
  )
}

function InputNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-yellow-500 bg-card px-4 py-3 shadow-lg shadow-yellow-500/20">
      <div className="flex items-center gap-2">
        <Circle className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-yellow-500 !bg-yellow-500"
      />
    </div>
  )
}

function DFlipFlopNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-green-500 bg-card px-4 py-3 shadow-lg shadow-green-500/20 min-w-[120px]">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="d"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-green-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="clk"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500"
      />
      <div className="flex items-center justify-center gap-2">
        <Cpu className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>D</span>
        <span>Q</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>CLK</span>
        <span>Q̅</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        id="q"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-green-500"
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="qbar"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-500"
      />
    </div>
  )
}

function JKFlipFlopNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-purple-500 bg-card px-4 py-3 shadow-lg shadow-purple-500/20 min-w-[120px]">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="j"
        style={{ top: '25%' }}
        className="!h-3 !w-3 !border-2 !border-purple-500 !bg-purple-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="clk"
        style={{ top: '50%' }}
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="k"
        style={{ top: '75%' }}
        className="!h-3 !w-3 !border-2 !border-purple-500 !bg-purple-500"
      />
      <div className="flex items-center justify-center gap-2">
        <Cpu className="h-5 w-5 text-purple-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>J</span>
        <span>Q</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>CLK</span>
        <span></span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>K</span>
        <span>Q̅</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        id="q"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-purple-500 !bg-purple-500"
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="qbar"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-500"
      />
    </div>
  )
}

function TFlipFlopNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-lg border-2 border-cyan-500 bg-card px-4 py-3 shadow-lg shadow-cyan-500/20 min-w-[120px]">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="t"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-cyan-500 !bg-cyan-500"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="clk"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-500"
      />
      <div className="flex items-center justify-center gap-2">
        <Cpu className="h-5 w-5 text-cyan-500" />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>T</span>
        <span>Q</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>CLK</span>
        <span>Q̅</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right}
        id="q"
        style={{ top: '30%' }}
        className="!h-3 !w-3 !border-2 !border-cyan-500 !bg-cyan-500"
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="qbar"
        style={{ top: '70%' }}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-500"
      />
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

const initialNodes: Node[] = [
  { id: 'clock-1', type: 'clock', position: { x: 50, y: 100 }, data: { label: 'Clock' } },
  { id: 'input-1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Input' } },
  { id: 'dff-1', type: 'dFlipFlop', position: { x: 250, y: 150 }, data: { label: 'D-FF 1' } },
  { id: 'dff-2', type: 'dFlipFlop', position: { x: 450, y: 150 }, data: { label: 'D-FF 2' } },
  { id: 'output-1', type: 'output', position: { x: 650, y: 150 }, data: { label: 'Output' } },
]

const initialEdges: Edge[] = [
  { id: 'e1', source: 'clock-1', target: 'dff-1', targetHandle: 'clk', animated: true, style: { stroke: '#f97316' } },
  { id: 'e2', source: 'clock-1', target: 'dff-2', targetHandle: 'clk', animated: true, style: { stroke: '#f97316' } },
  { id: 'e3', source: 'input-1', target: 'dff-1', targetHandle: 'd', style: { stroke: '#eab308' } },
  { id: 'e4', source: 'dff-1', sourceHandle: 'q', target: 'dff-2', targetHandle: 'd', style: { stroke: '#22c55e' } },
  { id: 'e5', source: 'dff-2', sourceHandle: 'q', target: 'output-1', style: { stroke: '#22c55e' } },
]

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeIdCounter, setNodeIdCounter] = useState(10)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  const addNode = useCallback((type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${nodeIdCounter}`,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label },
    }
    setNodes((nds) => [...nds, newNode])
    setNodeIdCounter((c) => c + 1)
  }, [setNodes, nodeIdCounter])

  return (
    <div className="flex h-full">
      {/* Component Palette */}
      <div className="w-56 border-r border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Components</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Click to add components to the canvas. Connect them by dragging from handles.
        </p>
        <div className="space-y-2">
          {componentsList.map((comp) => (
            <button
              key={comp.type}
              onClick={() => addNode(comp.type, comp.label)}
              className={`w-full rounded-md border border-${comp.color}-500/50 bg-secondary/50 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-${comp.color}-500/20 hover:border-${comp.color}-500`}
            >
              {comp.label}
            </button>
          ))}
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
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
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
            className="!bg-card !border-border !rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
