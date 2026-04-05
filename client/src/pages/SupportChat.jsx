import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import './SupportChat.css';

// PREDEFINED_RESPONSES is now handled by Gemini AI on the backend

const SupportChat = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState([
        { text: `Hi ${user?.username || 'there'}! I'm your Support Bot. How can I help you today?`, isBot: true, id: Date.now() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        // Add user message
        const newUserMsg = { text, isBot: false, id: Date.now() };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            
            if (data.error) {
                setMessages(prev => [...prev, { text: `Error: ${data.error}`, isBot: true, id: Date.now() + 1 }]);
            } else {
                setMessages(prev => [...prev, { text: data.reply, isBot: true, id: Date.now() + 1 }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { text: "I'm having trouble connecting to the support server. Please make sure the server is running.", isBot: true, id: Date.now() + 1 }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="support-container">
            <div className="chat-window">
                <header className="chat-header">
                    <Bot size={24} className="bot-icon-header" />
                    <h2>Support Assistant</h2>
                </header>
                
                <div className="messages-area">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                            <div className="avatar">
                                {msg.isBot ? <Bot size={18} /> : <UserIcon size={18} />}
                            </div>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="avatar"><Bot size={18} /></div>
                            <div className="message-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your question here..."
                    />
                    <button type="submit" disabled={!inputValue.trim()} className="send-btn">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportChat;
