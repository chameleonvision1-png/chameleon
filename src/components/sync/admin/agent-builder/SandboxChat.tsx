import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessagePart } from 'ai';
import { MessageSquare, Bot, User, Send, Loader2 } from 'lucide-react';
import { Node } from '@xyflow/react';

interface SandboxChatProps {
  nodes: Node[];
}

export function SandboxChat({ nodes }: SandboxChatProps) {
  const modelNode = nodes.find(n => n.type === 'model');
  const personaNode = nodes.find(n => n.type === 'persona');
  const guardrailsNode = nodes.find(n => n.type === 'guardrails');
  const knowledgeNode = nodes.find(n => n.type === 'knowledge');
  const policiesNode = nodes.find(n => n.type === 'policies');

  const DEFAULT_MODEL = 'gemini-3.1-pro-preview';
  const rawModelName = modelNode?.data?.modelName;
  const modelId = typeof rawModelName === 'string' && rawModelName.trim() ? rawModelName.trim() : DEFAULT_MODEL;

  const currentConfig = {
    model: modelId,
    persona: `Role: ${personaNode?.data?.role || ''}\nTone: ${personaNode?.data?.tone || ''}`,
    guardrails: (guardrailsNode?.data?.rules || '') + (policiesNode?.data?.policies ? `\n\n[POLICIES & RULES]\n${policiesNode.data.policies}` : ''),
    knowledge_base: knowledgeNode?.data?.context || ''
  };

  const [input, setInput] = useState('');

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/agent/sandbox',
    body: { config: currentConfig }
  }), [modelId, currentConfig.persona, currentConfig.guardrails, currentConfig.knowledge_base]);

  const { messages, status, sendMessage } = useChat({
    transport
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getTextContent = (parts: UIMessagePart<any, any>[] | undefined) => {
    if (!parts) return '';
    return parts
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map(p => p.text)
      .join('');
  };

  return (
    <div className="flex-1 rounded-2xl border border-white/5 bg-[#0d1530] p-4 flex flex-col h-[350px]">
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <MessageSquare className="w-5 h-5 text-(--sync-yellow)" />
        <h3 className="font-bold">Sandbox Test Chat</h3>
      </div>
      
      <div 
        ref={chatContainerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 text-sm">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Send a message to test your current configuration.</p>
            <p className="text-xs mt-1">(Uses the canvas state above, saving is not required)</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-(--sync-yellow)/20 flex shrink-0 items-center justify-center border border-(--sync-yellow)/30">
                  <Bot className="w-4 h-4 text-(--sync-yellow)" />
                </div>
              )}
              <div className={`p-3 rounded-xl max-w-[85%] text-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-black/40 text-white/90 border border-white/5 rounded-tl-none'
              }`}>
                {getTextContent(m.parts as any)}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex shrink-0 items-center justify-center border border-blue-500/30">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-(--sync-yellow)/20 flex items-center justify-center border border-(--sync-yellow)/30">
              <Bot className="w-4 h-4 text-(--sync-yellow)" />
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 rounded-tl-none flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-(--sync-yellow)" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Test message..."
          aria-label="Message input"
          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-(--sync-yellow)/50"
        />
        <button 
          type="submit" 
          aria-label="Send message"
          aria-disabled={isLoading || !input?.trim()}
          disabled={isLoading || !input?.trim()}
          className="p-2 bg-(--sync-yellow) text-black rounded-xl hover:bg-(--sync-yellow)/90 transition-colors disabled:opacity-50 flex items-center justify-center w-10"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
