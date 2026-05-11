import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldAlert } from 'lucide-react';

interface GuardrailsNodeData {
  rules?: string;
  onChange?: (key: string, value: string) => void;
}

export function GuardrailsNode({ data }: { data: GuardrailsNodeData }) {
  return (
    <div className="bg-[#0d1530] border border-red-500/30 rounded-xl p-4 w-72 shadow-xl relative nodrag cursor-default">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500 border-2 border-[#0d1530]" />
      <div className="flex items-center gap-2 mb-3 text-red-400">
        <ShieldAlert className="w-5 h-5" />
        <h3 className="font-bold text-sm">Guardrails & Rules</h3>
      </div>
      <div>
        <label htmlFor="guardrails-rules" className="block text-xs font-bold opacity-70 mb-1 text-white">Strict Instructions (What NOT to say)</label>
        <textarea 
          id="guardrails-rules"
          className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
          placeholder="e.g. Do not invent prices. Do not offer discounts. Never discuss politics."
          value={data.rules || ''}
          onChange={(e) => data.onChange && data.onChange('guardrails_rules', e.target.value)}
          aria-label="Strict Instructions"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-red-500 border-2 border-[#0d1530]" />
    </div>
  );
}
