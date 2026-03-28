'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Brain, Send, Loader2, Bot, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'
import { useAuthStore } from '@/lib/auth-store'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ParsedAction[]
}

interface ParsedAction {
  type: string;
  [key: string]: any;
}

interface DebugPanelProps {
  onClose: () => void
}

/** Extract [ACTION: {...}] blocks from the AI's reply text */
function parseActions(text: string): { cleanText: string; actions: ParsedAction[] } {
  const actions: ParsedAction[] = []
  // Use a simple index-based parser to avoid needing the 's' regex flag
  const ACTION_START = '[ACTION:'
  const ACTION_END = ']'
  let cleanText = text
  let idx = cleanText.indexOf(ACTION_START)
  while (idx !== -1) {
    const jsonStart = idx + ACTION_START.length
    const jsonEnd = cleanText.indexOf(ACTION_END, jsonStart)
    if (jsonEnd === -1) break
    const jsonStr = cleanText.slice(jsonStart, jsonEnd).trim()
    try {
      actions.push(JSON.parse(jsonStr))
    } catch {}
    cleanText = (cleanText.slice(0, idx) + cleanText.slice(jsonEnd + 1)).trim()
    idx = cleanText.indexOf(ACTION_START)
  }
  return { cleanText, actions }
}

export function AIDebugPanel({ onClose }: DebugPanelProps) {
  const { 
    projectId,
    currentCycle,
    circuitType,
    flipFlops,
    activeSignals,
    changedComponents,
    numFlipFlops,
    clockFrequency,
    // Circuit control actions
    setCircuitType,
    setNumFlipFlops,
    setClockFrequency,
    setInputBitSequence,
    resetSimulation,
  } = useSimulationStore()
  
  const { token } = useAuthStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (projectId && token) {
      fetch(`http://localhost:3001/api/chat/history/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })))
        }
      })
      .catch(console.error)
    }
  }, [projectId, token])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  /** Apply parsed AI actions to the real simulator state */
  const applyActions = (actions: ParsedAction[]) => {
    for (const action of actions) {
      switch (action.type) {
        case 'SET_CIRCUIT':
          if (action.circuitType) setCircuitType(action.circuitType)
          if (action.numFlipFlops) setNumFlipFlops(Number(action.numFlipFlops))
          if (action.frequency) setClockFrequency(Number(action.frequency))
          if (action.inputBits) setInputBitSequence(action.inputBits)
          break
        case 'RESET_SIMULATION':
          resetSimulation()
          break
        case 'SET_INPUT':
          if (action.inputBits) setInputBitSequence(action.inputBits)
          break
        case 'SET_FREQUENCY':
          if (action.frequency) setClockFrequency(Number(action.frequency))
          break
        case 'SET_FLIP_FLOPS':
          if (action.numFlipFlops) setNumFlipFlops(Number(action.numFlipFlops))
          break
      }
    }
  }

  const handleSend = async () => {
    if (!inputMsg.trim()) return
    if (!projectId) {
      setMessages(prev => [...prev, { role: 'system', content: '⚠️ Save or open a project first to use AI chat.' }])
      return
    }

    const userMessage = inputMsg
    setInputMsg('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    const { nodes, edges } = useSimulationStore.getState()

    try {
      const res = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          message: userMessage,
          context: {
            currentCycle,
            circuitType,
            numFlipFlops,
            clockFrequency,
            flipFlops,
            activeSignals,
            changedComponents: Array.from(changedComponents),
            nodes,
            edges
          }
        })
      })
      const data = await res.json()
      if (res.ok) {
        const { cleanText, actions } = parseActions(data.reply)
        const assistantMsg: Message = { role: 'assistant', content: cleanText, actions }
        setMessages(prev => [...prev, assistantMsg])
        if (actions.length > 0) {
          applyActions(actions)
        }
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.error}` }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: '⚠️ Failed to connect to the Chat API. Is the backend running?' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Assistant</h2>
          <span className="text-[10px] text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded font-mono">llama-3.3-70b</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Capability Hint */}
      {messages.length === 0 && (
        <div className="px-4 py-3 border-b border-border bg-primary/5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            💡 Try: <span className="text-primary font-medium italic">"Change to a 6-bit Ring Counter"</span> or <span className="text-primary font-medium italic">"Set frequency to 3Hz"</span> — I can modify the circuit directly!
          </p>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-5 bg-background/50"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-full opacity-50 space-y-4 pt-8">
            <Brain className="h-10 w-10 text-primary opacity-60" />
            <p className="text-sm text-foreground max-w-[200px] leading-relaxed">
              Ask me to analyze, debug, or <strong>change</strong> your circuit in real-time!
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary/20 text-primary' 
                : msg.role === 'system' 
                  ? 'bg-destructive/20 text-destructive' 
                  : 'bg-primary text-primary-foreground'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="flex flex-col gap-1.5 max-w-[85%]">
              <div className={`text-sm rounded-2xl p-3.5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary/10 border-primary/20 border rounded-tr-none' 
                  : msg.role === 'system' 
                    ? 'bg-destructive/10 border-destructive/20 border text-destructive text-xs' 
                    : 'bg-card border border-border/50 rounded-tl-none leading-relaxed text-foreground'
              }`}>
                {msg.content}
              </div>
              {/* Action notification badges */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {msg.actions.map((action, aIdx) => (
                    <span
                      key={aIdx}
                      className="inline-flex items-center gap-1 text-[10px] bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-mono"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      Applied: {action.type.replace('_', ' ').toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full shadow-sm bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 text-sm rounded-2xl p-3.5 bg-card border border-border/50 text-muted-foreground rounded-tl-none pr-6">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> 
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div className="h-px" />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        {!projectId && (
          <p className="text-[10px] text-amber-400 mb-2 text-center">⚠️ Open a project to enable AI memory</p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input 
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            placeholder="Ask AI or say 'change circuit to...'" 
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!inputMsg.trim() || isLoading} className="rounded-full shadow-md w-10 h-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
