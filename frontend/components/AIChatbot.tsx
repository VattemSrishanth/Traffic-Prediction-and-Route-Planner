'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Maximize2, Minimize2, Send, X } from 'lucide-react'

type ChatRole = 'user' | 'bot'

interface Message {
  id: string
  type: ChatRole
  content: string
  timestamp: Date
}

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content:
            "Hello! I'm your AI traffic assistant. Ask me about routes, traffic, or carpooling.",
          timestamp: new Date(),
        },
      ])
    }
  }, [messages.length])

  // Open from header icon
  useEffect(() => {
    const open = () => setIsOpen(true)
    window.addEventListener('open_chatbot' as any, open)
    return () => window.removeEventListener('open_chatbot' as any, open)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = () => {
    const text = input.trim()
    if (!text || isTyping) return
    const userMsg: Message = {
      id: `${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsTyping(true)

    // Mock AI response
    setTimeout(() => {
      const reply: Message = {
        id: `${Date.now()}-r`,
        type: 'bot',
        content: generateReply(text),
        timestamp: new Date(),
      }
      setMessages((m) => [...m, reply])
      setIsTyping(false)
    }, 900)
  }

  // Simple command integration to trigger map features
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.type !== 'user') return
    const t = last.content.toLowerCase()
    if (t.includes('locate') || t.includes('gps')) {
      window.dispatchEvent(new Event('locate_me'))
    }
    if (t.includes('traffic')) {
      window.dispatchEvent(new Event('show_traffic'))
    }
  }, [messages])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          aria-label="Open AI assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-40 flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all ${
            isMinimized ? 'h-16' : 'h-96'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                onClick={() => setIsMinimized((v) => !v)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="p-4 space-y-3 overflow-y-auto max-h-64">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        m.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask me about traffic, routes, or carpooling..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

function generateReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('traffic')) return 'Current traffic is moderate. Expect minor delays on major routes.'
  if (t.includes('route') || t.includes('directions')) return 'Tell me your start and destination, I\'ll suggest optimal routes.'
  if (t.includes('carpool')) return 'I can help find carpool matches along your route and schedule.'
  if (t.includes('weather')) return 'Light rain expected later today; plan for slightly slower speeds.'
  return 'I can help with traffic conditions, route planning, and carpooling. What would you like to do?'
}

export default AIChatbot
export { AIChatbot }


