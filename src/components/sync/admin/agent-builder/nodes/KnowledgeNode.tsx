import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

interface KnowledgeNodeData {
  context?: string;
  onChange?: (key: string, value: string) => void;
}

export function KnowledgeNode({ data }: { data: KnowledgeNodeData }) {
  return (
    <div className="bg-[#0d1530] border border-blue-500/30 rounded-xl p-4 w-80 shadow-xl relative nodrag cursor-default">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-[#0d1530]" />
      <div className="flex items-center gap-2 mb-3 text-blue-400">
        <Database className="w-5 h-5" />
        <h3 className="font-bold text-sm">Knowledge Base</h3>
      </div>
      <div>
        <label htmlFor="knowledge-context" className="block text-xs font-bold opacity-70 mb-1 text-white">Context (Prices, FAQs, Policies)</label>
        <textarea 
          id="knowledge-context"
          className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
          placeholder="e.g. The cost of a 1-month subscription is $15. The system supports Facebook and Instagram. Refunds are only allowed within 3 days of purchase."
          value={data.context || ''}
          onChange={(e) => data.onChange && data.onChange('knowledge_context', e.target.value)}
          aria-label="Knowledge Base Context"
        />
      </div>
    </div>
  );
}
