import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

// Initialize the Google AI client once
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let femaleVoice = null;

// Find and load a female voice for TTS
const loadFemaleVoice = () => {
    if (femaleVoice || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return; // Voices not ready yet

    femaleVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Samantha') || voice.name.includes('Google UK English Female'))
    // FIX: Cast voice to any to access the non-standard 'gender' property.
    ) || voices.find(voice => voice.lang.startsWith('en-US') && (voice as any).gender === 'female') || null;
};

// Listen for voices to be loaded
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadFemaleVoice;
    loadFemaleVoice(); // Initial attempt
}

const stripEmojis = (text) => {
    if (!text) return '';
    // This regex removes a wide range of emojis to prevent TTS from reading them.
    const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF])/g;
    return text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
};


// Helper to speak text using browser's TTS
const speakText = (text, onEndCallback) => {
    if (!text || !('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
    }
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);

    if (!femaleVoice) {
      loadFemaleVoice(); // Try to load again if not available
    }

    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    utterance.onend = onEndCallback;
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error", e);
        if (onEndCallback) onEndCallback();
    };
    window.speechSynthesis.speak(utterance);
};


const MicIcon = ({ isRecording }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const HeadsetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)'}}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
);

const NewRobotIcon = () => (
    <div className="robot-icon-container">
        <svg width="90" height="90" viewBox="0 0 100 100">
            <defs>
                <radialGradient id="robotGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="60%" stopColor="#2ecc71" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2ecc71" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#robotGlow)" />
            <g transform="translate(25, 25) scale(0.5)">
                 {/* Head */}
                <circle cx="50" cy="50" r="40" fill="#D3D3D3" />
                 {/* Eyes */}
                <ellipse cx="38" cy="50" rx="8" ry="12" fill="#0d1a2e" />
                <ellipse cx="62" cy="50" rx="8" ry="12" fill="#0d1a2e" />
                 {/* Crown */}
                <path d="M 35 25 L 40 15 L 50 22 L 60 15 L 65 25 Z" fill="#2ecc71" />
            </g>
        </svg>
    </div>
);

const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="stop-icon">
        <path d="M6 6h12v12H6z"/>
    </svg>
);

const CoinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f0c419" />
      <circle cx="12" cy="12" r="8" stroke="#DAA520" strokeWidth="2" strokeDasharray="2 2" />
      <text x="12" y="17" fontFamily="sans-serif" fontSize="12" fill="#8B4513" textAnchor="middle" fontWeight="bold">A</text>
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const InvestmentPrompt = ({ onInvest }) => {
    return (
        <div className="investment-prompt">
            <div className="investment-buttons">
                <button onClick={() => onInvest(100)}>Invest ₹100</button>
                <button onClick={() => onInvest(500)}>Invest ₹500</button>
                <button onClick={() => onInvest(1000)}>Invest ₹1000</button>
            </div>
        </div>
    );
};

const ChatScreen = ({ onNavigateToGold }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [speakingMessageId, setSpeakingMessageId] = useState(null);

    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatRef = useRef<Chat | null>(null);
    const onSpeechEndCallbackRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        try {
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are Kubera, a friendly and expert financial assistant. Your primary goal is to provide helpful financial guidance. When a user asks about "gold" or "investment," your response must be enthusiastic and focused on encouraging them to use our app. Emphasize how easy it is to buy and sell 24k digital gold directly through the app, starting with very small amounts. Highlight only the positive aspects: it's pure, secure, and easily accessible from their phone. Do not mention any risks like market fluctuations. Your response should include a line like: 'Speaking of gold, have you considered Digital Gold? ✨ It allows you to easily invest in 24k pure gold, right from your phone. 💰 You can start with as little as ₹10, making it accessible for everyone.' For all other topics (saving, debt management, budgeting, etc.), provide concise, helpful, and safe financial advice.`,
                    // Disable thinking for lower latency responses
                    thinkingConfig: { thinkingBudget: 0 },
                },
            });
        } catch(e) {
            console.error(e);
            // Handle API key error gracefully in a real app
        }
        
        // Cleanup on unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleStopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // This prevents utterance.onend
            if (onSpeechEndCallbackRef.current) {
                onSpeechEndCallbackRef.current(); // Manually trigger cleanup/follow-up
            } else {
                setSpeakingMessageId(null); // Fallback
            }
        }
    };

    const generateResponse = async (userMessageText) => {
        if (!chatRef.current) {
            console.error("Chat not initialized");
            setIsLoading(false);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
            return;
        }

        setIsLoading(true);
        const aiMessageId = `ai-${Date.now()}`;
        // Add a placeholder for the AI response
        setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);
        
        let finalAiText = '';

        try {
            const result = await chatRef.current.sendMessageStream({ message: userMessageText });
            
            for await (const chunk of result) {
                finalAiText += chunk.text;
                // More performant update: only change the last message
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.id === aiMessageId) {
                       lastMessage.text = finalAiText;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error generating response:", error);
            finalAiText = "An error occurred. Please try again.";
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: finalAiText } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
        
        const onSpeechEnd = () => {
            setSpeakingMessageId(null);
            // Show investment prompt after AI finishes speaking, if relevant
            if (/gold|sona|investment/i.test(userMessageText)) {
                setMessages(prev => {
                    return prev.map(msg => 
                        msg.id === aiMessageId 
                        ? { ...msg, showInvestmentPrompt: true } 
                        : msg
                    );
                });
            }
            onSpeechEndCallbackRef.current = null;
        };


        onSpeechEndCallbackRef.current = onSpeechEnd;
        setSpeakingMessageId(aiMessageId);
        const textForSpeech = stripEmojis(finalAiText);
        speakText(textForSpeech, onSpeechEnd);
    };

    const handleSendMessage = async (text) => {
        if (!text.trim() || isLoading) return;
        const userMessageText = text.trim();
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessageText }]);
        setInputText('');
        await generateResponse(userMessageText);
    };
    
    const handleSuggestionClick = (text) => {
        handleSendMessage(text);
    };

    const handleRecordToggle = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported by your browser. Please try using a modern browser like Chrome or Edge.");
            return;
        }

        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;

            recognition.onstart = () => {
                setIsRecording(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleSendMessage(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert('Microphone access was denied. Please allow microphone access in your browser settings.');
                } else {
                    alert(`An error occurred during speech recognition: ${event.error}`);
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
                recognitionRef.current = null;
            };

            recognition.start();
        }
    };


    return (
        <div className="app-container">
            <header className="chat-header">
                <button className="back-button" aria-label="Go Back">‹</button>
                <h1>Kuber.AI</h1>
                <div className="header-actions">
                    <button className="icon-button" aria-label="Support"><HeadsetIcon /></button>
                    <button className="chat-history-button">Chat History</button>
                </div>
            </header>
            <div className="chat-window">
                {messages.length === 0 && !isLoading && (
                     <div className="chat-intro">
                        <NewRobotIcon />
                        <button className="main-query-button" onClick={() => inputRef.current?.focus()}>Ask me Your Financial Queries</button>
                        <div className="first-chat-promo">
                            <span>Begin your first Chat with Kuber AI</span>
                            <div className="coin-reward">
                                <CoinIcon />
                                <span>50</span>
                            </div>
                        </div>
                    </div>
                )}
                {messages.map((msg) => (
                     <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                        {msg.component ? msg.component : 
                            <div className={`chat-bubble ${msg.id === speakingMessageId ? 'speaking' : ''}`}>
                                {msg.id === speakingMessageId && (
                                     <button onClick={handleStopSpeaking} className="speech-control-button" aria-label="Stop speaking">
                                        <StopIcon />
                                    </button>
                                )}
                                <span>{msg.text}</span>
                                {msg.text === '' && msg.sender === 'ai' && <span className="cursor"></span>}
                                {msg.showInvestmentPrompt && <InvestmentPrompt onInvest={onNavigateToGold} />}
                            </div>
                        }
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.text !== '' && (
                    <div className="chat-bubble-wrapper ai">
                        <div className="chat-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <footer className="footer">
                 {messages.length === 0 && !isLoading && (
                    <div className="suggestion-chips">
                        <button onClick={() => handleSuggestionClick('Tax Saving Tips')}>Tax Saving Tips ↗</button>
                        <button onClick={() => handleSuggestionClick('वित्तीय सेहत')}>वित्तीय सेहत ↗</button>
                        <button onClick={() => handleSuggestionClick('Manage Your Expenses')}>Manage Your Expenses</button>
                    </div>
                 )}
                <form className="input-area" onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}>
                    <div className="text-input-wrapper">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Pay off your debt" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        type="button"
                        className={`mic-button ${isRecording ? 'recording' : ''}`} 
                        onClick={handleRecordToggle}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        disabled={isLoading}
                    >
                        <MicIcon isRecording={isRecording} />
                    </button>
                </form>
                <div className="privacy-notice">
                    <LockIcon />
                    <span>Your data is safe with us</span>
                </div>
            </footer>
            <style>{`
                .chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background-color: var(--background-color);
                    color: var(--header-text);
                    border-bottom: 1px solid #1a2c47;
                }
                .chat-header h1 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }
                .back-button {
                    background: none;
                    border: none;
                    color: var(--header-text);
                    font-size: 2.5rem;
                    cursor: pointer;
                    padding: 0;
                    margin-right: 8px;
                    line-height: 1;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .icon-button {
                    background: none;
                    border: 1px solid var(--accent-color);
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .chat-history-button {
                    background-color: var(--button-secondary-bg);
                    color: var(--primary-text);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                }
                .chat-window {
                    flex-grow: 1;
                    padding: 16px 8px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .chat-intro {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding-bottom: 50px;
                }
                .robot-icon-container {
                    background-color: rgba(31, 42, 60, 0.8);
                    border-radius: 50%;
                    padding: 8px;
                    margin-bottom: 24px;
                }
                .main-query-button {
                    background: linear-gradient(to right, #2c6c9e, #255d8c);
                    color: white;
                    border: none;
                    width: 80%;
                    max-width: 300px;
                    padding: 16px;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 30px;
                    cursor: pointer;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .first-chat-promo {
                    background-color: #000;
                    color: var(--secondary-text);
                    border-radius: 20px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.8rem;
                }
                .coin-reward {
                    background-color: #1a2c47;
                    border-radius: 15px;
                    padding: 4px 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--accent-color);
                    font-weight: bold;
                }

                .chat-bubble-wrapper { display: flex; width: 100%; }
                .chat-bubble-wrapper.user { justify-content: flex-end; }
                .chat-bubble-wrapper.ai { justify-content: flex-start; }
                .chat-bubble {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .user .chat-bubble {
                    background-color: var(--user-bubble-bg);
                    color: var(--user-bubble-text);
                    border-bottom-right-radius: 4px;
                }
                .ai .chat-bubble {
                    background-color: var(--ai-bubble-bg);
                    color: var(--ai-bubble-text);
                    border-bottom-left-radius: 4px;
                }
                .ai .chat-bubble.speaking {
                    animation: speaking-glow 1.5s ease-in-out infinite;
                }
                @keyframes speaking-glow {
                    0% { box-shadow: 0 0 2px var(--accent-color); }
                    50% { box-shadow: 0 0 8px var(--accent-color); }
                    100% { box-shadow: 0 0 2px var(--accent-color); }
                }
                .speech-control-button {
                    background: transparent;
                    border: none;
                    padding: 0;
                    margin: 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: sound-waves 1.5s ease-in-out infinite;
                }
                .stop-icon {
                    color: var(--accent-color);
                }
                @keyframes sound-waves {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.1); opacity: 1; }
                }

                .investment-prompt {
                    width: 100%;
                    margin-top: 8px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                }
                .investment-buttons {
                    display: flex;
                    gap: 8px;
                }
                .investment-buttons button {
                    flex: 1;
                    background-color: var(--button-secondary-bg);
                    color: var(--primary-text);
                    border: 1px solid var(--button-secondary-bg);
                    border-radius: 20px;
                    padding: 8px 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .investment-buttons button:hover {
                    background-color: #3b8ac4;
                }

                .footer {
                    padding: 8px 16px 16px 16px;
                    background-color: var(--background-color);
                }
                .suggestion-chips {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                    overflow-x: auto;
                    padding-bottom: 4px; /* For scrollbar space */
                }
                .suggestion-chips::-webkit-scrollbar { display: none; }
                .suggestion-chips { scrollbar-width: none; }
                .suggestion-chips button {
                    flex-shrink: 0;
                    background-color: var(--ai-bubble-bg);
                    color: var(--secondary-text);
                    border: 1px solid var(--ai-bubble-bg);
                    border-radius: 20px;
                    padding: 8px 12px;
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                .input-area { 
                    display: flex; 
                    align-items: center;
                    gap: 8px;
                }
                .text-input-wrapper {
                    flex-grow: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .text-input-wrapper input {
                    width: 100%;
                    height: 48px;
                    border-radius: 24px;
                    border: none;
                    background-color: white;
                    padding: 0 20px;
                    font-size: 1rem;
                    color: #333;
                }
                .text-input-wrapper input:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .text-input-wrapper input:focus { outline: 2px solid var(--accent-color); }
                
                .mic-button {
                    width: 48px;
                    height: 48px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    border: none;
                    background-color: var(--button-primary-bg);
                    color: var(--button-primary-text);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mic-button:disabled {
                    background-color: #555;
                    cursor: not-allowed;
                }
                .mic-button.recording {
                    background-color: #dc3545;
                    color: white;
                }
                .privacy-notice {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: var(--secondary-text);
                    margin-top: 12px;
                }
                .typing-indicator span {
                  height: 8px; width: 8px; float: left; margin: 0 2px;
                  background-color: var(--secondary-text); display: block;
                  border-radius: 50%; opacity: 0.4; animation: 1s blink infinite;
                }
                .typing-indicator span:nth-child(2) { animation-delay: .2s; }
                .typing-indicator span:nth-child(3) { animation-delay: .4s; }
                @keyframes blink { 50% { opacity: 1; } }

                .cursor {
                    display: inline-block;
                    width: 8px;
                    height: 1em;
                    background-color: var(--primary-text);
                    animation: cursor-blink 1.2s infinite;
                    vertical-align: text-bottom;
                }
                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const GoldScreen = ({ onBack, onInvestmentSuccess, initialAmount = null }) => {
    const [amount, setAmount] = useState(initialAmount ? String(initialAmount.toFixed(2)) : '10.00');
    const [grams, setGrams] = useState('');
    const countdownRef = useRef(null);

    const calculateGrams = (value) => {
        const numericValue = parseFloat(value) || 0;
        const currentPricePerGram = 10299.85 * 1.03; // Including 3% GST
        if (numericValue > 0) {
            const calculatedGrams = (numericValue / currentPricePerGram).toFixed(4);
            setGrams(`=${calculatedGrams}g`);
        } else {
            setGrams('=0g');
        }
    };
    
    useEffect(() => {
        calculateGrams(amount); // Calculate grams on initial render
    }, [amount]);


    useEffect(() => {
        const duration = 60 * 4 + 57;
        const display = countdownRef.current;
        if (!display) return;
        
        let timer = duration;
        const intervalId = setInterval(() => {
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            display.textContent = `${minutes}:${seconds}`;
            if (--timer < 0) {
                // In a real app, you'd fetch a new price here.
                timer = duration; 
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(value);
    };
    
    const handleAmountFocus = () => {
        if (amount === '00.00' || amount === '10.00') {
            setAmount('');
        }
    };

    const handleAmountBlur = () => {
        if (amount === '' || parseFloat(amount) === 0) {
            setAmount('00.00');
        } else {
            setAmount(parseFloat(amount).toFixed(2));
        }
    };

    const handleInvestNow = (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            alert('Please enter a valid amount to invest.');
            return;
        }
        
        const investmentDetails = {
            amount: numericAmount.toFixed(2),
            grams: grams.substring(1).replace('g', ''), // remove '=' and 'g'
            date: new Date(),
            transactionId: `616${Math.floor(100000 + Math.random() * 900000)}`
        };
        onInvestmentSuccess(investmentDetails);
    };

    return (
        <div className="app-container gold-page">
            <header>
                <button onClick={onBack} className="back-arrow" aria-label="Go Back">‹</button>
                <h1>Digital Gold</h1>
            </header>
            <main className="gold-content">
                <div className="tabs">
                    <button className="tab-item active">Buy</button>
                    <button className="tab-item">Sell</button>
                    <button className="tab-item">Gift 🎁</button>
                </div>
                <section className="buy-header">
                    <div>
                        <h2>Buy 24k Pure Gold</h2>
                        <p>Starting as low as ₹10</p>
                    </div>
                    <svg className="gold-bars-icon" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 15.5L16.5 10.5L46.5 21L32.5 26L2.5 15.5Z" fill="#F0C419" stroke="#E6A800" strokeWidth="1"/>
                        <path d="M18.5 8.5L32.5 3.5L62.5 14L48.5 19L18.5 8.5Z" fill="#F0C419" stroke="#E6A800" strokeWidth="1"/>
                        <path d="M2 28.5L16 23.5L46 34L32 39L2 28.5Z" fill="#F0C419" stroke="#E6A800" strokeWidth="1"/>
                    </svg>
                </section>
                <section className="investment-card">
                    <label htmlFor="amount-input">Enter Amount</label>
                    <div className="amount-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input type="text" id="amount-input" value={amount} onChange={handleAmountChange} onFocus={handleAmountFocus} onBlur={handleAmountBlur} inputMode="decimal" />
                        <span id="gram-equivalent">{grams}</span>
                    </div>
                    <div className="price-info">
                        <span>Current Price: <strong>₹10,299.85/g</strong> + 3% GST</span>
                        <div className="timer" aria-label="Price holds for">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"></path></svg>
                            <span ref={countdownRef}>04:57</span>
                        </div>
                    </div>
                    <div className="storage-info">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v10.8z"></path></svg>
                        <span>Secure, Bank-Grade Storage</span>
                    </div>
                    <button className="invest-button" onClick={handleInvestNow}>Invest Now</button>
                    <p className="powered-by">Powered By <strong>SAFEGOLD</strong></p>
                </section>
                <section className="why-digital">
                    <h2>Why go digital?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="icon">🔟</div>
                            <h3>Start with Just ₹10</h3>
                        </div>
                        <div className="feature-card">
                            <div className="icon">🛡️</div>
                            <h3>100% Secure & Insured</h3>
                        </div>
                    </div>
                </section>
                <footer>
                    <a href="#" className="help-link" onClick={e => e.preventDefault()}>
                        <span className="help-link-text">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                            <span>Help & FAQs</span>
                        </span>
                        <span>›</span>
                    </a>
                </footer>
            </main>
            <style>{`
            .gold-page {
                --card-bg: #1f2a3c;
                --button-bg: #4a5a70;
                --button-text: #ffffff;
                padding: 0 16px;
                background-color: var(--background-color);
                color: var(--primary-text);
            }
            .gold-page > header {
                display: flex;
                align-items: center;
                padding: 16px 0;
            }
            .gold-page .back-arrow {
                font-size: 2.5rem;
                color: var(--primary-text);
                text-decoration: none;
                margin-right: 16px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .gold-page header h1 {
                font-size: 1.25rem;
                margin: 0;
                font-weight: 600;
            }
            .gold-content {
                flex-grow: 1;
                overflow-y: auto;
                padding-bottom: 24px;
            }
            .gold-content::-webkit-scrollbar { display: none; }
            .gold-content { scrollbar-width: none; }

            .tabs {
                display: flex;
                gap: 16px;
                margin-bottom: 24px;
                border-bottom: 1px solid var(--card-bg);
            }
            .tab-item {
                background: none;
                border: none;
                color: var(--secondary-text);
                padding: 12px 4px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            .tab-item.active {
                color: var(--accent-color);
                border-bottom-color: var(--accent-color);
            }
            .buy-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            .buy-header h2 {
                font-size: 1.1rem;
                margin: 0 0 4px;
                font-weight: 600;
            }
            .buy-header p {
                font-size: 0.8rem;
                color: var(--secondary-text);
                margin: 0;
            }
            .gold-bars-icon { width: 60px; height: auto; }
            
            .investment-card {
                background-color: var(--card-bg);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }
            .investment-card label {
                display: block;
                text-align: left;
                font-size: 0.9rem;
                color: var(--secondary-text);
                margin-bottom: 8px;
            }
            .amount-input-wrapper {
                display: flex;
                align-items: center;
                border-bottom: 2px solid var(--accent-color);
                padding-bottom: 8px;
                margin-bottom: 16px;
            }
            .currency-symbol {
                font-size: 2rem;
                font-weight: 600;
                margin-right: 8px;
            }
            #amount-input {
                flex-grow: 1;
                background: none;
                border: none;
                color: var(--primary-text);
                font-size: 2.5rem;
                font-weight: 600;
                width: 100%;
                padding: 0;
            }
            #amount-input:focus { outline: none; }
            #gram-equivalent {
                font-size: 1.2rem;
                color: var(--secondary-text);
            }
            .price-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
                margin-bottom: 16px;
            }
            .price-info strong { color: var(--accent-color); font-weight: 600; }
            .timer { display: flex; align-items: center; gap: 4px; }
            .timer svg { width: 14px; height: 14px; fill: currentColor; }
            .storage-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 0.8rem;
                padding: 8px;
                background-color: rgba(0,0,0,0.2);
                border-radius: 20px;
                margin-bottom: 20px;
            }
            .storage-info svg { width: 16px; height: 16px; fill: currentColor; }
            .invest-button {
                width: 100%;
                padding: 16px;
                border: none;
                border-radius: 8px;
                background-color: var(--button-bg);
                color: var(--button-text);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
                margin-bottom: 8px;
            }
            .invest-button:hover { opacity: 0.9; }
            .powered-by {
                text-align: center;
                font-size: 0.8rem;
                color: var(--secondary-text);
                margin: 0;
            }
            .powered-by strong { font-weight: 700; color: #fff; }
            .why-digital h2 {
                font-size: 1.1rem;
                margin-bottom: 16px;
                font-weight: 600;
            }
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            }
            .feature-card {
                background-color: var(--card-bg);
                padding: 16px;
                border-radius: 8px;
                text-align: left;
            }
            .feature-card .icon { font-size: 2rem; margin-bottom: 8px; }
            .feature-card h3 { font-size: 0.9rem; margin: 0; font-weight: 500; }
            .help-link {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: var(--card-bg);
                padding: 16px;
                border-radius: 8px;
                color: var(--primary-text);
                text-decoration: none;
                font-weight: 500;
            }
            .help-link-text { display: flex; align-items: center; gap: 8px; }
            .help-link-text svg { fill: currentColor; }
            `}</style>
        </div>
    );
};


const ReceiptScreen = ({ transactionDetails, onGoBack }) => {
    const { amount, grams, date, transactionId } = transactionDetails;

    const formattedDate = date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).replace(/,/g, '');

    return (
        <div className="app-container receipt-page">
            <header>
                <button onClick={onGoBack} className="back-arrow" aria-label="Go Back">‹</button>
                <h1>Receipt</h1>
            </header>
            <main className="receipt-content">
                <div className="receipt-card">
                    <div className="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2>Order Successful</h2>
                    <p className="subtitle">We appreciate your trust. Enjoy your new gold</p>

                    <div className="investment-details-card">
                        <div className="icon-24k">
                            <svg viewBox="0 0 24 24" fill="#f0c419"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" fontSize="8" fill="#0d1a2e" textAnchor="middle" fontWeight="bold">24K</text></svg>
                        </div>
                        <div className="investment-info">
                            <span>Invested in gold</span>
                            <strong>₹{amount}</strong>
                        </div>
                        <div className="shield-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f0c419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="8 12 11 15 16 10"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    <ul className="transaction-details">
                        <li>
                            <span>Gold Weight</span>
                            <strong>{grams} g</strong>
                        </li>
                        <li>
                            <span>Date & time</span>
                            <strong>{formattedDate}</strong>
                        </li>
                        <li>
                            <span>Transaction ID</span>
                            <strong>{transactionId}</strong>
                        </li>
                        <li>
                            <span>Powered by</span>
                            <strong className="safegold-logo">
                               <svg height="12" viewBox="0 0 98.75 14.62" fill="#fff"><path d="M13.62,11.39a6.11,6.11,0,0,1-4.24,1.6,6.4,6.4,0,0,1-6.42-6.47,6.38,6.38,0,0,1,6.42-6.46,6.18,6.18,0,0,1,4.14,1.5L12,3.12A3.84,3.84,0,0,0,9.4,2.15a3.89,3.89,0,0,0-3.83,4,3.87,3.87,0,0,0,3.83,4,3.79,3.79,0,0,0,2.55-1Zm-3-9.85a.86.86,0,0,1,.83.62L13,6.35H8.16a.88.88,0,0,1,0-1.75H12.3a1.41,1.41,0,0,0,0-2.82H10.59A.86.86,0,0,1,9.76,1Z"></path><path d="M24.4,12.78a8.31,8.31,0,0,1-2,.21,4.2,4.2,0,0,1-4.23-4.4c0-3.32,2.4-4.45,4.23-4.45a7.3,7.3,0,0,1,1.7.2V1.65a8,8,0,0,0-1.7-.19c-3.6,0-6.64,2.3-6.64,7,0,4.4,2.83,7,6.64,7a8.52,8.52,0,0,0,2-.26Z"></path><path d="M37.8,12.78a8.31,8.31,0,0,1-2,.21,4.2,4.2,0,0,1-4.23-4.4c0-3.32,2.4-4.45,4.23-4.45a7.3,7.3,0,0,1,1.7.2V1.65a8,8,0,0,0-1.7-.19c-3.6,0-6.64,2.3-6.64,7,0,4.4,2.83,7,6.64,7a8.52,8.52,0,0,0,2-.26Z"></path><path d="M41.43,4.29V1.44h5.79V0H39.2v13h8V11.53h-5.82V7.11h5V4.29Z"></path><path d="M57.6,13V0H55.37V13Zm-1.16-14.62a1.16,1.16,0,1,1-1.16,1.16A1.16,1.16,0,0,1,56.44-1.62Z"></path><path d="M60.19,13V0H68V2.82H62.42V4.88h4.86V7.7h-4.86v2.44H68V13Z"></path><path d="M78.6,13h-2.4L73.34,0h2.6Zm-2-2.82,1-3.21.9,3.21Z"></path><path d="M89,13,85.27,0h2.6l2.35,8.73L92.61,0H95L91.3,13Z"></path><path d="M98.75,8.19a3.78,3.78,0,0,1-.52,2,3.31,3.31,0,0,1-3,2.15,3.46,3.46,0,0,1-3.53-3.53,3.48,3.48,0,0,1,3.53-3.54,3.22,3.22,0,0,1,3.06,2.2h-2a1.1,1.1,0,0,0-1.07-.79,1.25,1.25,0,0,0-1.28,1.34,1.27,1.27,0,0,0,1.28,1.35,1.1,1.1,0,0,0,1.09-.8Z"></path></svg>
                                SAFEGOLD
                            </strong>
                        </li>
                    </ul>

                    <div className="receipt-actions">
                        <button>
                            Get Invoice 
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </button>
                        <button>
                            Share Now
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18"cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </div>
                </div>
                <button className="go-back-button" onClick={onGoBack}>Go Back</button>
            </main>
            <style>{`
            .receipt-page {
                --card-bg: #1f2a3c;
                padding: 0 16px;
                background-color: var(--background-color);
                color: var(--primary-text);
                display: flex;
                flex-direction: column;
            }
            .receipt-page > header {
                display: flex;
                align-items: center;
                padding: 16px 0;
                flex-shrink: 0;
            }
            .receipt-page .back-arrow {
                font-size: 2.5rem;
                color: var(--primary-text);
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                margin-right: 16px;
                line-height: 1;
            }
            .receipt-page header h1 {
                font-size: 1.25rem;
                margin: 0;
                font-weight: 600;
            }
            .receipt-content {
                flex-grow: 1;
                overflow-y: auto;
                padding-bottom: 24px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .receipt-content::-webkit-scrollbar { display: none; }
            .receipt-content { scrollbar-width: none; }

            .receipt-card {
                background-color: var(--card-bg);
                border-radius: 20px;
                padding: 24px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .success-icon {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background-color: #2ecc71;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 16px;
            }
            .success-icon svg {
                width: 32px;
                height: 32px;
                color: white;
            }
            .receipt-card h2 {
                font-size: 1.25rem;
                margin: 0 0 8px;
            }
            .receipt-card .subtitle {
                font-size: 0.9rem;
                color: var(--secondary-text);
                margin: 0 0 24px;
            }
            
            .investment-details-card {
                background-color: #0d1a2e;
                border-radius: 12px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 24px;
            }
            .icon-24k svg { width: 32px; height: 32px; }
            .investment-info {
                display: flex;
                flex-direction: column;
            }
            .investment-info span {
                font-size: 0.8rem;
                color: var(--secondary-text);
            }
            .investment-info strong {
                font-size: 1.5rem;
                font-weight: 600;
            }
            .shield-icon svg { width: 28px; height: 28px; }

            .transaction-details {
                list-style: none;
                padding: 0;
                margin: 0 0 24px;
                width: 100%;
                text-align: left;
            }
            .transaction-details li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #34495e;
            }
            .transaction-details li:last-child {
                border-bottom: none;
            }
            .transaction-details li span {
                color: var(--secondary-text);
                font-size: 0.9rem;
            }
            .transaction-details li strong {
                font-weight: 500;
                color: #f0c419;
            }
            .transaction-details li .safegold-logo {
                display: flex;
                align-items: center;
                gap: 4px;
                color: white;
            }
            
            .receipt-actions {
                display: flex;
                gap: 12px;
                width: 100%;
                margin-bottom: 16px;
            }
            .receipt-actions button {
                flex: 1;
                background-color: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: var(--primary-text);
                border-radius: 8px;
                padding: 12px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
             .receipt-actions button svg {
                width: 16px;
                height: 16px;
             }

            .go-back-button {
                width: 100%;
                max-width: 400px;
                margin-top: auto;
                padding: 16px;
                border: 1px solid var(--accent-color);
                background-color: transparent;
                color: var(--accent-color);
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
            }
            `}</style>
        </div>
    );
};


const App = () => {
    const [page, setPage] = useState('chat'); // 'chat', 'gold', or 'receipt'
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [investmentAmount, setInvestmentAmount] = useState(null);

    const handleInvestmentSuccess = (details) => {
        setTransactionDetails(details);
        setPage('receipt');
    };
    
    const handleGoBackToChat = () => {
        setTransactionDetails(null);
        setInvestmentAmount(null);
        setPage('chat');
    };

    const handleNavigateToGold = (amount) => {
        setInvestmentAmount(amount);
        setPage('gold');
    };

    if (page === 'gold') {
        return <GoldScreen onBack={() => setPage('chat')} onInvestmentSuccess={handleInvestmentSuccess} initialAmount={investmentAmount} />;
    }
    
    if (page === 'receipt' && transactionDetails) {
        return <ReceiptScreen transactionDetails={transactionDetails} onGoBack={handleGoBackToChat} />;
    }

    return <ChatScreen onNavigateToGold={handleNavigateToGold} />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
