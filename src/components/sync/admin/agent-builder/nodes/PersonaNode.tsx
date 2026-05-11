import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { UserCircle } from 'lucide-react';

interface PersonaNodeData {
  role?: string;
  tone?: string;
  onChange?: (key: string, value: string) => void;
}

export function PersonaNode({ data }: { data: PersonaNodeData }) {
  return (
    <div className="bg-[#0d1530] border border-(--sync-yellow)/30 rounded-xl p-4 w-72 shadow-xl relative nodrag cursor-default">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-(--sync-yellow) border-2 border-[#0d1530]" />
      <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--sync-yellow)' }}>
        <UserCircle className="w-5 h-5" />
        <h3 className="font-bold text-sm">Agent Persona</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label htmlFor="persona-role" className="block text-xs font-bold opacity-70 mb-1 text-white">Role</label>
          <input 
            id="persona-role"
            type="text" 
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-(--sync-yellow)/50"
            placeholder="e.g. Sales Representative"
            value={data.role || ''}
            onChange={(e) => data.onChange && data.onChange('persona_role', e.target.value)}
            aria-label="Persona Role"
          />
        </div>
        <div>
          <label htmlFor="persona-tone" className="block text-xs font-bold opacity-70 mb-1 text-white">Tone of Voice</label>
          <input 
            id="persona-tone"
            type="text" 
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-(--sync-yellow)/50"
            placeholder="e.g. Professional and friendly"
            value={data.tone || ''}
            onChange={(e) => data.onChange && data.onChange('persona_tone', e.target.value)}
            aria-label="Persona Tone"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-(--sync-yellow) border-2 border-[#0d1530]" />
    </div>
  );
}
