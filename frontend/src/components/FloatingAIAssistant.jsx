import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minimize2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../App';

const QUICK_PROMPTS = [
  'How do I schedule a viewing?',
  'What services do you offer?',
  'Tell me about properties in Accra',
  'How does buying property work in Ghana?',
];

const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${Backendurl}/api/ai/status`);
        setAiAvailable(res.data.available);
      } catch {
        // Fallback is always available
        setAiAvailable(true);
      }
    };
    checkStatus();
    
    // Add initial greeting
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm Jona, your real estate assistant. How can I help you today?"
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, minimized]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || message).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${Backendurl}/api/ai/chat`, {
        message: trimmed,
        history: messages.slice(-10),
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      const fallback = err.response?.data?.fallback;
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallback
            ? "I'm currently offline, but you can browse properties at /properties or contact our team at /contact for help!"
            : 'Sorry, something went wrong. Please try again.',
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setMinimized(false);
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm Jona, your real estate assistant. How can I help you today?",
          },
        ]);
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-xl flex items-center justify-center group"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              maxHeight: minimized ? '56px' : '520px',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              }}
              onClick={() => setMinimized(!minimized)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm leading-tight">Jona AI</h4>
                  <p className="text-white/70 text-[10px]">
                    {aiAvailable === false ? 'Offline mode' : 'Real estate assistant'}
                  </p>
                </div>
              </div>
              <button className="text-white/70 hover:text-white transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            {!minimized && (
              <>
                {/* Messages */}
                <div className="h-[340px] overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[var(--accent)] text-white rounded-br-md'
                            : msg.error
                            ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 items-start">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 1 && !isLoading && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Offline Warning */}
                {aiAvailable === false && (
                  <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    AI is offline. Responses may be limited.
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 text-sm px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!message.trim() || isLoading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                      style={{
                        background: message.trim() && !isLoading
                          ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                          : 'var(--bg-secondary)',
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[var(--text-secondary)] animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIAssistant;
