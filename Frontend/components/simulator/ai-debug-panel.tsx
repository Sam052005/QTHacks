'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Brain, Settings, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'
import { useAuthStore } from '@/lib/auth-store'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DebugPanelProps {
  onClose: () => void
}

export function AIDebugPanel({ onClose }: DebugPanelProps) {
  const { 
    projectId, 
    groqApiKey, 
    setGroqApiKey,
    currentCycle,
    circuitType,
    flipFlops,
    activeSignals,
    changedComponents
  } = useSimulationStore()
  
  const { token } = useAuthStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempKey, setTempKey] = useState(groqApiKey)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history when projectId changes
    if (projectId && token) {
      fetch(`http://localhost:3001/api/chat/history/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages)
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

  const handleSend = async () => {
    if (!inputMsg.trim()) return
    if (!groqApiKey) {
      setShowSettings(true)
      return
    }
    if (!projectId) {
      setMessages(prev => [...prev, { role: 'system', content: 'You must save or start a Project to use the AI Chat.' }])
      return
    }

    const userMessage = inputMsg
    setInputMsg('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          apiKey: groqApiKey,
          message: userMessage,
          context: {
            currentCycle,
            circuitType,
            flipFlops,
            activeSignals,
            changedComponents: Array.from(changedComponents)
          }
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.error}` }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'system', content: 'Failed to connect to the Chat API.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={groqApiKey ? "ghost" : "destructive"} size="sm" onClick={() => setShowSettings(!showSettings)} className="h-7 w-7 p-0" title="API Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showSettings ? (
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="text-sm font-medium mb-2">Groq API Settings</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Enter your Groq API Key to power the logic assistant. Keys are stored locally in your browser.
          </p>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={tempKey} 
              onChange={e => setTempKey(e.target.value)} 
              placeholder="gsk_..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button size="sm" className="h-9" onClick={() => {
              setGroqApiKey(tempKey)
              setShowSettings(false)
            }}>Save</Button>
          </div>
        </div>
      ) : null}

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-5 bg-background/50"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-full opacity-50 space-y-4">
            <Brain className="h-10 w-10 text-primary opacity-60" />
            <p className="text-sm text-foreground max-w-[200px] leading-relaxed">
              Ask me to analyze your circuit, explain logic gates, or debug timing issues!
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full shadow-sm ${msg.role === 'user' ? 'bg-primary/20 text-primary' : msg.role === 'system' ? 'bg-destructive/20 text-destructive' : 'bg-primary text-primary-foreground'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`text-sm rounded-2xl p-3.5 max-w-[85%] shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary/10 border-primary/20 border rounded-tr-none' 
                : msg.role === 'system' 
                  ? 'bg-destructive/10 border-destructive/20 border text-destructive text-xs' 
                  : 'bg-card border border-border/50 rounded-tl-none leading-relaxed text-foreground'
            }`}>
              {msg.content}
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
              <span className="animate-pulse">Analyzing logic state...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
      </div>

      <div className="p-4 border-t border-border bg-card shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input 
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            placeholder="Ask AI about this logic state..." 
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
