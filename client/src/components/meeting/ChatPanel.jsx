import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { Input, Button } from '../ui';

const MAX_MESSAGE_LENGTH = 1000;

export const ChatPanel = React.memo(({ roomId, isOpen, onClose }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('chat-message', onMessage);

    return () => {
      socket.off('chat-message', onMessage);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = useCallback((e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !socket) return;

    socket.emit('chat-message', { roomId, text: trimmed.slice(0, MAX_MESSAGE_LENGTH) });
    setInputText('');
  }, [inputText, socket, roomId]);

  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-80 h-full bg-dark-900 border-l border-dark-700 flex flex-col shadow-2xl z-30 animate-slide-up absolute right-0 top-0 bottom-0 sm:relative">
      <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-800/50">
        <h2 className="text-lg font-semibold">In-call messages</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-8 w-8 text-gray-400 hover:text-white"
          aria-label="Close chat panel"
        >
          <X size={18} />
        </Button>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-gray-500 text-sm">Messages can only be seen by people in the call and are deleted when the call ends.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === socket.id;
            return (
              <div key={msg.id} className={`flex flex-col animate-fade-in ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-300">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm break-words ${
                    isMe
                      ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-tr-none'
                      : 'bg-dark-700 text-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-dark-800 bg-dark-800/30">
        <form onSubmit={sendMessage} className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Type a message</label>
          <Input
            id="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-dark-900 border-dark-700"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <Button type="submit" variant="primary" size="icon" disabled={!inputText.trim()} aria-label="Send message">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
});

ChatPanel.displayName = 'ChatPanel';
