import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck } from 'lucide-react';

interface PoliciesNodeData {
  policies?: string;
  onChange?: (key: string, value: string) => void;
}

export function PoliciesNode({ data }: { data: PoliciesNodeData }) {
  return (
    <div className="bg-[#0d1530] border border-(--sync-yellow)/30 rounded-xl p-4 w-72 shadow-xl relative nodrag cursor-default">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-(--sync-yellow) border-2 border-[#0d1530]" />
      <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--sync-yellow)' }}>
        <ShieldCheck className="w-5 h-5" />
        <h3 className="font-bold text-sm">Policies & Privacy</h3>
      </div>
      <div>
        <label htmlFor="agent-policies" className="block text-xs font-bold opacity-70 mb-1 text-white">Official Links & Rules</label>
        <textarea 
          id="agent-policies"
          className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-(--sync-yellow)/50 resize-none custom-scrollbar"
          placeholder="e.g. Provide official links, terms of service, and strict operational rules for the bot..."
          value={data.policies || ''}
          onChange={(e) => data.onChange && data.onChange('policies_policies', e.target.value)}
          aria-label="Policies and Rules"
        />
      </div>
    </div>
  );
}
