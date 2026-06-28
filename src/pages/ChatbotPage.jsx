import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Sprout, RefreshCw } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Greetings! I am FloraAI, your digital botanist companion. Ask me any questions regarding soil moisture levels, plant toxicity, vase calibrations, or crop grids!",
      time: '11:20 AM'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const getAIResponse = (query) => {
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

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputVal;
    setInputVal('');
    setTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getAIResponse(query),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 900);
  };

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
        {/* Sidebar Help suggestions */}
        <div className="card" style={styles.helpSidebar}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-lime)" />
            Sample Inquiries
          </h3>
          <div style={styles.helpDivider}></div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
            Click any prompt below to query FloraAI instantly:
          </p>
          <div style={styles.promptsList}>
            <button onClick={() => setInputVal('How do I care for my Monstera?')} style={styles.promptBtn}>
              🌿 Care for Monstera
            </button>
            <button onClick={() => setInputVal('Which plants grow in low light?')} style={styles.promptBtn}>
              🌘 Low light options
            </button>
            <button onClick={() => setInputVal('How to make roses last longer?')} style={styles.promptBtn}>
              🌹 Fresh Rose Bouquets
            </button>
            <button onClick={() => setInputVal('Are these plants toxic to dogs?')} style={styles.promptBtn}>
              🐾 Pet toxicity guides
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-container" style={{ flex: 2 }}>
          <div className="chat-header">
            <Sprout size={20} color="var(--accent-lime)" />
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-white)' }}>FloraAI Assistant</h4>
              <span style={{ fontSize: '11px', color: 'var(--success)' }}>● Botanical Core Online</span>
            </div>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((msg) => (
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
                  color: msg.sender === 'user' ? 'rgba(5, 22, 14, 0.6)' : 'var(--text-muted)'
                }}>{msg.time}</span>
              </div>
            ))}

            {typing && (
              <div className="chat-message bot" style={styles.typingIndicator}>
                <RefreshCw size={14} className="pulse-light" style={{ animation: 'spin 1.5s linear infinite' }} />
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
            />
            <button type="submit" className="btn btn-primary" style={styles.sendBtn}>
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
  helpSidebar: {
    flex: '1 0 260px',
    alignSelf: 'flex-start',
    padding: '24px',
  },
  helpDivider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '12px 0',
  },
  promptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  promptBtn: {
    textAlign: 'left',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'var(--transition)',
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
  }
};

