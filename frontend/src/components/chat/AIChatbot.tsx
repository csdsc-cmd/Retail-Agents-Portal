import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AIChatbot.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedAction {
  label: string;
  action: () => void;
}

// Simulated AI responses based on keywords
function generateAIResponse(query: string, navigate: (path: string) => void): { response: string; actions: SuggestedAction[] } {
  const lowerQuery = query.toLowerCase();

  // Agent-related queries
  if (lowerQuery.includes('agent') && (lowerQuery.includes('status') || lowerQuery.includes('health') || lowerQuery.includes('how'))) {
    return {
      response: "Based on the current data, 20 out of 21 agents are operating normally. The Competitor Price Monitor agent is showing degraded performance with an 87% success rate, which is below our 95% target. All other agents are healthy with success rates above 96%.",
      actions: [
        { label: 'View Dashboard', action: () => navigate('/') },
        { label: 'View Affected Agent', action: () => navigate('/agents') },
      ],
    };
  }

  if (lowerQuery.includes('agent') && lowerQuery.includes('degraded')) {
    return {
      response: "The Competitor Price Monitor agent is currently in degraded status. It's experiencing a higher than normal escalation rate (8%) and reduced success rate (87%). This may be due to increased competitor pricing volatility. The agent is still operational but may require investigation.",
      actions: [
        { label: 'View Agent Details', action: () => navigate('/agents') },
        { label: 'View Transaction Logs', action: () => navigate('/explainability') },
      ],
    };
  }

  // Cost-related queries
  if (lowerQuery.includes('cost') || lowerQuery.includes('spend') || lowerQuery.includes('budget')) {
    return {
      response: "Your current monthly AI operating costs are tracking within budget. The total spend across all 21 agents is generating a positive ROI - for every dollar spent on AI operations, you're generating approximately $15-20 in business value through automation, faster decisions, and reduced manual effort.",
      actions: [
        { label: 'View Cost Analysis', action: () => navigate('/costs') },
        { label: 'Adjust Budget', action: () => navigate('/costs') },
      ],
    };
  }

  // ROI-related queries
  if (lowerQuery.includes('roi') || lowerQuery.includes('return') || lowerQuery.includes('value') || lowerQuery.includes('savings')) {
    return {
      response: "Your AI agent portfolio is delivering strong ROI. The Executive Insights category has the highest ROI with agents like the Daily Business Summary generating $125 per transaction in value. Customer Service agents handle the highest volume, processing over 2,000 transactions daily with 60% faster resolution times.",
      actions: [
        { label: 'View ROI Analysis', action: () => navigate('/costs') },
        { label: 'View Agent Performance', action: () => navigate('/agents') },
      ],
    };
  }

  // Incident-related queries
  if (lowerQuery.includes('incident') || lowerQuery.includes('alert') || lowerQuery.includes('issue') || lowerQuery.includes('problem')) {
    return {
      response: "There is 1 active incident: A supply chain disruption affecting North Island stores. The AI agents are coordinating an automated response including inventory reallocation and customer communication. The estimated revenue at risk is $180K, and the cross-dock transfer is in progress.",
      actions: [
        { label: 'View Incident Details', action: () => navigate('/incidents') },
        { label: 'View Dashboard', action: () => navigate('/') },
      ],
    };
  }

  // Integration-related queries
  if (lowerQuery.includes('integration') || lowerQuery.includes('d365') || lowerQuery.includes('platform') || lowerQuery.includes('connect')) {
    return {
      response: "Your agents are integrated with 3 D365 platforms: Finance & Operations (primary for 15 agents), Customer Engagement (CRM - 6 agents), and Business Central (10 agents). All integrations are currently healthy with no connectivity issues detected.",
      actions: [
        { label: 'View Dashboard', action: () => navigate('/') },
        { label: 'View Agents', action: () => navigate('/agents') },
      ],
    };
  }

  // Transaction/explainability queries
  if (lowerQuery.includes('transaction') || lowerQuery.includes('decision') || lowerQuery.includes('explain') || lowerQuery.includes('why')) {
    return {
      response: "You can view detailed explainability logs for all agent transactions. Each decision includes the input data, reasoning steps, confidence score, rules applied, and outcome. This provides full transparency into how your AI agents make decisions.",
      actions: [
        { label: 'View Transaction Logs', action: () => navigate('/explainability') },
      ],
    };
  }

  // Category queries
  if (lowerQuery.includes('inventory')) {
    return {
      response: "You have 5 Inventory Intelligence agents handling stock monitoring, shelf gap detection, inventory reconciliation, demand forecasting, and warehouse synchronization. These agents collectively prevent stockouts and reduce carrying costs by 18% on average.",
      actions: [
        { label: 'View Inventory Agents', action: () => navigate('/agents') },
      ],
    };
  }

  if (lowerQuery.includes('pricing') || lowerQuery.includes('promotion')) {
    return {
      response: "Your 4 Pricing & Promotions agents optimize pricing, track promotion performance, advise on markdowns, and monitor competitor prices. The Price Optimization Engine alone protects $24K in margin monthly.",
      actions: [
        { label: 'View Pricing Agents', action: () => navigate('/agents') },
      ],
    };
  }

  if (lowerQuery.includes('customer') || lowerQuery.includes('service') || lowerQuery.includes('return')) {
    return {
      response: "The 4 Customer Service & Returns agents handle inquiries, process returns, analyze feedback, and manage your loyalty program. They achieve 60% faster resolution times and handle over 2,000 customer interactions daily.",
      actions: [
        { label: 'View Customer Service Agents', action: () => navigate('/agents') },
      ],
    };
  }

  // Default response
  return {
    response: "I can help you understand your AI agent operations. Try asking about:\n• Agent status and health\n• Costs and ROI\n• Active incidents\n• Platform integrations\n• Transaction explainability\n• Specific agent categories (inventory, pricing, customer service, etc.)",
    actions: [
      { label: 'View Dashboard', action: () => navigate('/') },
      { label: 'View All Agents', action: () => navigate('/agents') },
      { label: 'View Cost Analysis', action: () => navigate('/costs') },
    ],
  };
}

export default function AIChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Agent Portal assistant. I can help you understand your agent status, costs, ROI, incidents, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setSuggestedActions([]);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const { response, actions } = generateAIResponse(input, navigate);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setSuggestedActions(actions);
    setIsTyping(false);
  };

  const handleQuickAction = (question: string) => {
    setInput(question);
  };

  const quickQuestions = [
    "How are my agents performing?",
    "What's my current ROI?",
    "Are there any active incidents?",
    "Show me cost breakdown",
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="16" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className={styles.chatHeaderContent}>
              <h3>AI Assistant</h3>
              <span className={styles.chatHeaderStatus}>Online</span>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.map(message => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <div className={styles.messageContent}>
                  {message.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <span className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className={styles.suggestedActions}>
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  className={styles.actionButton}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className={styles.quickQuestions}>
              <span className={styles.quickLabel}>Quick questions:</span>
              <div className={styles.quickButtons}>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className={styles.quickButton}
                    onClick={() => handleQuickAction(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your agents..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!input.trim() || isTyping}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
