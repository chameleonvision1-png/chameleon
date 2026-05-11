import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';

interface ModelNodeData {
  modelName: string;
  onChange?: (key: string, value: string) => void;
}

export function ModelNode({ data }: { data: ModelNodeData }) {
  return (
    <div className="bg-[#0d1530] border border-white/10 rounded-xl w-80 shadow-2xl overflow-hidden font-sans">
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-sync-yellow" />
        <h3 className="text-sm font-medium text-white m-0 tracking-wide">AI Model</h3>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-white/50 mb-1.5 block">Model Identifier</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-sync-yellow/50 transition-colors nodrag"
            value={data.modelName || ''}
            onChange={(e) => data.onChange?.('modelNode_modelName', e.target.value)}
            placeholder="e.g. gemini-3.1-pro-preview"
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sync-yellow border-2 border-[#0d1530]" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sync-yellow border-2 border-[#0d1530]" />
    </div>
  );
}
