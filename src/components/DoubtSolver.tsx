import React, { useState, useRef, useEffect } from 'react';
import { Send, CircleHelp, GraduationCap, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../types';

export default function DoubtSolver() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your BVRITH Academic Doubt Solver. Ask me any academic question, programming doubt, or requested explanation about your college curriculum. I am ready to assist!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question) return;

    if (!textToSend) {
      setInput('');
    }

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/solve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          history: messages.slice(-5).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve academic doubt.');
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `${Date.now()}-ai`,
        sender: 'ai',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-ai-error`,
        sender: 'ai',
        text: "I could not reach the doubt-solver service right now. Please restart the app server and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedDoubts = [
    "Explain Banker's Algorithm in Operating Systems",
    "What is Dijkstra's routing and where is it used?",
    "Derive the math for Gradient Descent in Machine Learning",
    "Explain the difference between TCP and UDP protocols concisely"
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-[600px] overflow-hidden animate-fade-in" id="doubt-solver-container">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
            <CircleHelp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-base">AI Doubt Solver</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Trained on syllabus models & programming libraries</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <GraduationCap className="h-4 w-4" /> Academic Assistant
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            id={`chat-msg-${msg.id}`}
          >
            <div
              className={`p-3.5 rounded-2xl text-sm leading-relaxed relative group ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-100 rounded-bl-none border border-slate-200/40 dark:border-slate-750/30'
              }`}
            >
              {/* Message text with newline rendering */}
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              
              {msg.sender === 'ai' && (
                <button
                  onClick={() => copyToClipboard(msg.id, msg.text)}
                  className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  title="Copy explanation"
                >
                  {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm italic mr-auto bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-250/20">
            <RefreshIcon className="h-4 w-4 animate-spin" />
            Generating clear explanation & study tips...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested doubt bubble triggers if chat is short */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedDoubts.map((doubt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(doubt)}
                className="text-xs bg-white dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-350 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/50 cursor-pointer transition-colors"
              >
                {doubt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-sans"
            placeholder="E.g., What is dynamic binding in OOPs?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      viewBox="0 0 24 24"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}
