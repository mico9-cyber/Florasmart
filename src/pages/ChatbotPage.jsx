import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, Send, Sparkles, Sprout, RefreshCw, Plus, Trash2, Archive, History } from 'lucide-react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { chatbotService } from '../services/chatbotService';

export default function ChatbotPage() {
  const { quickAskChatbot } = useContext(AppContext);
  const addToast = useToast();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [convLoading, setConvLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setConvLoading(true);
    try {
      const res = await chatbotService.listConversations('?archived=false');
      const list = res?.data?.conversations || [];
      setConversations(list);
      if (list.length > 0) {
        setActiveConv(list[0].id);
        await loadConversationMessages(list[0].id);
      } else {
        setMessages([]);
        setConvLoading(false);
      }
    } catch {
      setConvLoading(false);
    }
  };

  const loadConversationMessages = async (id) => {
    try {
      const res = await chatbotService.getConversation(id);
      const conv = res?.data?.conversation;
      const msgs = conv?.messages?.map((m) => ({
        id: m.id || Date.now() + Math.random(),
        sender: m.sender === 'user' ? 'user' : 'bot',
        text: m.content || m.text || '',
        time: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
      })) || [];
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setConvLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await chatbotService.startConversation({ title: 'New Chat' });
      const conv = res?.data?.conversation;
      if (conv) {
        setConversations((prev) => [conv, ...prev]);
        setActiveConv(conv.id);
        setMessages([]);
      }
    } catch {
      addToast('Failed to start new conversation.', 'error');
    }
  };

  const handleArchiveConv = async (id) => {
    try {
      await chatbotService.archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv === id) {
        const next = conversations.find((c) => c.id !== id);
        if (next) {
          setActiveConv(next.id);
          await loadConversationMessages(next.id);
        } else {
          setActiveConv(null);
          setMessages([]);
        }
      }
      addToast('Conversation archived.', 'success');
    } catch {
      addToast('Failed to archive conversation.', 'error');
    }
  };

  const handleDeleteConv = async (id) => {
    try {
      await chatbotService.removeConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv === id) {
        const next = conversations.find((c) => c.id !== id);
        if (next) {
          setActiveConv(next.id);
          await loadConversationMessages(next.id);
        } else {
          setActiveConv(null);
          setMessages([]);
        }
      }
      addToast('Conversation deleted.', 'success');
    } catch {
      addToast('Failed to delete conversation.', 'error');
    }
  };

  const switchConversation = async (id) => {
    setActiveConv(id);
    setConvLoading(true);
    await loadConversationMessages(id);
  };

  const getFallbackResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('monstera')) {
      return "Monstera Deliciosa flourishes in bright indirect light. Water when the top 2 inches of soil are dry (about once a week). Caution: leaves contain calcium oxalate crystals which are toxic to dogs and cats.";
    }
    if (q.includes('rose') || q.includes('bouquet')) {
      return "For fresh-cut Rose Bouquets: Trim stems at a 45-degree angle under water to prevent air locks, change the vase water daily, and add flower preservative. Keep away from direct drafts or radiators.";
    }
    if (q.includes('low light') || q.includes('dark') || q.includes('shade')) {
      return "Excellent low-light tolerators include the Snake Plant (Sansevieria) and Peace Lily. They can survive in dim corridors, though they grow faster with partial bright light.";
    }
    if (q.includes('pet') || q.includes('toxic') || q.includes('dog') || q.includes('cat')) {
      return "If pet safety is a priority, consider the Peace Lily or Snake Plant with extreme caution as they are toxic. Cast your focus on Ferns or Spider Plants which are completely non-toxic.";
    }
    if (q.includes('vase') || q.includes('fit')) {
      return "To calibrate vase pairings, aim for the vase height to be roughly 50-60% of the stem lengths. A flared vase works best for loose wild bouquets, while cylinders suit straight dense arrangements.";
    }
    return "I have run that query through my botanical knowledge bases. To verify suitability for your specific location, try our AI Suitability Scanner on the 'AI Advisor' tab!";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputVal;
    setInputVal('');
    setTyping(true);

    try {
      if (activeConv) {
        const res = await chatbotService.sendMessage(activeConv, { message: query });
        const reply = res?.data?.response || res?.data?.message?.content || res?.data?.message?.text;
        if (reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'bot',
              text: reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setTyping(false);
          return;
        }
      } else {
        const res = await quickAskChatbot({ message: query });
        const reply = res?.data?.response || res?.data?.answer || res?.data?.message;
        if (reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'bot',
              text: reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setTyping(false);
          return;
        }
      }
    } catch {
      addToast('Failed to get a response from FloraAI. Using offline knowledge base.', 'warning');
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: getFallbackResponse(query),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTyping(false);
    }, 900);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <MessageSquare size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>FloraAI Smart Chatbot</h1>
        <p style={styles.subtitle}>
          Diagnose plant health, review care schedules, and query arrangements with autonomous botanical intelligence.
        </p>
      </div>

      <div style={styles.chatWrapper}>
        {/* Sidebar: Conversation History */}
        <div className={`card ${sidebarOpen ? '' : 'collapsed'}`} style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={{ fontSize: '15px', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} color="var(--accent-lime)" />
              Conversations
            </h3>
            <button onClick={handleNewConversation} style={styles.newChatBtn} title="New conversation">
              <Plus size={16} />
            </button>
          </div>
          <div style={styles.helpDivider}></div>
          <div style={styles.convList}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
              Click any prompt below to query FloraAI instantly:
            </p>
            <div style={styles.promptsList}>
              <button onClick={() => setInputVal('How do I care for my Monstera?')} style={styles.promptBtn}>
                Care for Monstera
              </button>
              <button onClick={() => setInputVal('Which plants grow in low light?')} style={styles.promptBtn}>
                Low light options
              </button>
              <button onClick={() => setInputVal('How to make roses last longer?')} style={styles.promptBtn}>
                Fresh Rose Bouquets
              </button>
              <button onClick={() => setInputVal('Are these plants toxic to dogs?')} style={styles.promptBtn}>
                Pet toxicity guides
              </button>
            </div>
            <div style={styles.helpDivider}></div>
            <div style={styles.convItems}>
              {convLoading ? (
                <LoadingSpinner text="Loading conversations..." />
              ) : conversations.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No conversations yet. Start a new chat!
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    style={{
                      ...styles.convItem,
                      backgroundColor: conv.id === activeConv ? 'var(--accent-lime)' : 'transparent',
                      color: conv.id === activeConv ? 'var(--bg-darker)' : 'var(--text-light)',
                    }}
                  >
                    <button
                      onClick={() => switchConversation(conv.id)}
                      style={{
                        ...styles.convItemBtn,
                        color: conv.id === activeConv ? 'var(--bg-darker)' : 'var(--text-light)',
                      }}
                    >
                      <MessageSquare size={14} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                        {conv.title || `Chat ${conv.id?.slice(0, 8)}`}
                      </span>
                    </button>
                    <div style={styles.convActions}>
                      <button onClick={() => handleArchiveConv(conv.id)} style={styles.convActionBtn} title="Archive">
                        <Archive size={13} />
                      </button>
                      <button onClick={() => handleDeleteConv(conv.id)} style={styles.convActionBtn} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-container" style={{ flex: 2, minWidth: 0 }}>
          <div className="chat-header">
            <Sprout size={20} color="var(--accent-lime)" />
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-white)' }}>FloraAI Assistant</h4>
              <span style={{ fontSize: '11px', color: 'var(--success)' }}>Botanical Core Online</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.toggleSidebar}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? '<' : '>'}
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {convLoading ? (
              <LoadingSpinner text="Loading conversation..." />
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
                <MessageSquare size={40} color="var(--border-green)" />
                <p style={{ marginTop: '16px' }}>Start your conversation with FloraAI</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.sender}`}
                  style={{
                    ...styles.message,
                    backgroundColor: msg.sender === 'user' ? 'var(--accent-lime)' : 'var(--bg-darker)',
                    color: msg.sender === 'user' ? 'var(--bg-darker)' : 'var(--text-light)',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    borderBottomLeftRadius: msg.sender === 'bot' ? '0' : 'var(--radius-md)',
                    borderBottomRightRadius: msg.sender === 'user' ? '0' : 'var(--radius-md)',
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <span style={{
                    ...styles.time,
                    color: msg.sender === 'user' ? 'rgba(5, 22, 14, 0.6)' : 'var(--text-muted)',
                  }}>{msg.time}</span>
                </div>
              ))
            )}

            {typing && (
              <div className="chat-message bot" style={styles.typingIndicator}>
                <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>FloraAI is searching caretakers...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              placeholder="Ask FloraAI about plant care (e.g. 'monstera')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={styles.chatInput}
              aria-label="Chat message"
            />
            <button type="submit" className="btn btn-primary" style={styles.sendBtn} aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  chatWrapper: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  sidebar: {
    flex: '1 0 280px',
    alignSelf: 'flex-start',
    padding: '20px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newChatBtn: {
    backgroundColor: 'var(--accent-lime)',
    border: 'none',
    color: 'var(--bg-darker)',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  helpDivider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '12px 0',
  },
  convList: {
    display: 'flex',
    flexDirection: 'column',
  },
  promptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px',
  },
  promptBtn: {
    textAlign: 'left',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  convItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  convItem: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition)',
  },
  convItemBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
  },
  convActions: {
    display: 'flex',
    gap: '2px',
    paddingRight: '4px',
  },
  convActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
  },
  toggleSidebar: {
    marginLeft: 'auto',
    background: 'none',
    border: '1px solid var(--border-green)',
    color: 'var(--text-light)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  message: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: 'var(--shadow-sm)',
  },
  time: {
    fontSize: '10px',
    alignSelf: 'flex-end',
    fontWeight: '600',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-darker)',
    color: 'var(--text-muted)',
    alignSelf: 'flex-start',
    fontSize: '13px',
    padding: '10px 16px',
    border: '1px solid var(--border-green)',
    borderBottomLeftRadius: 0,
  },
  chatInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-dark)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-white)',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px 16px',
  },
};
