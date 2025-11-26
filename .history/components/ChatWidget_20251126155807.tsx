
import React, { useState, useRef, useEffect } from 'react';
// import { GeminiService } from '../services/geminiService';
import { ChatMessage, SiteConfig } from '../types';
import { StorageService } from '../services/storage';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Xin chào! Tôi là trợ lý ảo NintenBot. Bạn cần tìm game gì hay muốn tư vấn gì hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ facebookUrl: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load config for FB link
    setSiteConfig(StorageService.getSiteConfig());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const historyForAi = messages.map(m => ({ role: m.role, text: m.text }));
    // const aiResponseText = await GeminiService.chatWithAssistant(historyForAi, userMsg.text);

    setMessages(prev => [...prev, { role: 'model', text: 'hi' }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed z-50">
      {/* 
        Chat Window Container 
        - Mobile: Fixed inset-0 (fullscreen)
        - Desktop: Bottom right, fixed width/height
      */}
      {isOpen && (
        <div className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 bg-white sm:w-96 sm:h-[550px] sm:rounded-3xl shadow-2xl flex flex-col border-gray-100 ring-1 ring-gray-200 z-50 animate-fade-in-up overflow-hidden`}>
          
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
               <div className="bg-nintendo-red p-1.5 rounded-full text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               </div>
               <div>
                 <h3 className="font-bold text-gray-800 text-sm">NintenBot AI</h3>
                 <p className="text-xs text-green-500 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                 </p>
               </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Support Banner (Configurable Link) */}
          <div className="bg-blue-50 px-4 py-2 flex justify-between items-center text-xs flex-shrink-0">
            <span className="text-blue-700 font-medium">Cần hỗ trợ trực tiếp?</span>
            <a 
              href={siteConfig.facebookUrl || '#'} 
              target="_blank" 
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 0C5.373 0 0 4.986 0 11.138c0 3.518 1.748 6.64 4.502 8.653.218.156.357.408.357.676v2.333c0 .548.604.88 1.07.604l2.807-1.636c.204-.12.446-.153.673-.092 1.05.28 2.152.428 3.287.428 6.627 0 12-4.986 12-11.138S18.627 0 12 0zm-1.008 14.167l-2.458-3.923-4.8 3.923 5.275-5.602 2.458 3.923 4.802-3.923-5.277 5.602z"/>
              </svg>
              Chat Facebook
            </a>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-nintendo-red flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0 shadow-sm border border-white">AI</div>
                )}
                <div 
                  className={`max-w-[80%] px-4 py-3 text-sm ${
                    msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-nintendo-red flex items-center justify-center text-white text-xs mr-2 mt-1">AI</div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0 pb-safe">
            <input
              type="text"
              className="flex-grow bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-nintendo-red/50 text-gray-800"
              placeholder="Hỏi AI về game..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-nintendo-red hover:bg-nintendo-dark disabled:bg-gray-200 text-white rounded-xl px-4 transition-colors flex items-center justify-center shadow-lg shadow-red-500/20"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-black hover:bg-gray-800 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2 group border-4 border-white/20 active:scale-95"
        >
          <span className="hidden group-hover:block whitespace-nowrap text-sm font-bold pr-1 transition-all">Chat Hỗ Trợ</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
