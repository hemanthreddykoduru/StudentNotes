import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your NotesMarket assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Process response with a small delay for realism
        setTimeout(() => {
            const botResponse = generateResponse(userMsg.text.toLowerCase());
            setMessages(prev => [...prev, { id: Date.now() + 1, ...botResponse, sender: 'bot' }]);
        }, 600);
    };

    const generateResponse = (text) => {
        // Navigation / Search
        if (text.includes('note') || text.includes('search') || text.includes('find') || text.includes('subject')) {
            return {
                text: "You can search for notes by subject or title on our Home page.",
                action: { label: "Go to Search", path: "/" }
            };
        }

        // Pricing / Subscription
        if (text.includes('price') || text.includes('cost') || text.includes('pay') || text.includes('subscription') || text.includes('pro')) {
            return {
                text: "Our Pro plan gives you unlimited access for just ₹100/year.",
                action: { label: "View Pricing", path: "/pricing" }
            };
        }

        // Login / Account
        if (text.includes('login') || text.includes('sign') || text.includes('account')) {
            return {
                text: "You can log in or manage your account here.",
                action: { label: "Login / Account", path: "/login" }
            };
        }

        // Support
        if (text.includes('help') || text.includes('support') || text.includes('contact') || text.includes('refund')) {
            return {
                text: "Need assistance? Our support team is here for you.",
                action: { label: "Contact Support", path: "/support" }
            };
        }

        // General Greetings
        if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
            return { text: "Hello! Detailed questions work best. Try asking about 'pricing' or 'notes'." };
        }

        // Default
        return { text: "I'm not sure about that. Try asking about notes, pricing, or support!" };
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto mb-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-in slide-in-from-bottom-5 fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            <span className="font-bold">Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    {msg.action && (
                                        <button
                                            onClick={() => {
                                                navigate(msg.action.path);
                                            }}
                                            className="mt-2 text-xs font-bold underline hover:text-indigo-300 dark:hover:text-indigo-400 transition-colors block text-left"
                                        >
                                            → {msg.action.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask for help..."
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}
