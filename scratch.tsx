import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

function Test() {
  const transport = new DefaultChatTransport({ api: '/test' });
  const chat = useChat({ transport });
  return null;
}
