import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook, Copy, Check } from 'lucide-react';

interface TriggerNodeData {
  webhookUrl?: string;
}

export function TriggerNode({ data }: { data: TriggerNodeData }) {
  const [copied, setCopied] = useState(false);
  const url = data.webhookUrl || 'https://sync.chameleon.vision/api/webhook/meta';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d1530] border border-green-500/50 rounded-xl p-4 w-64 shadow-xl relative">
      <div className="flex items-center gap-2 mb-3 text-green-400">
        <Webhook className="w-5 h-5" />
        <h3 className="font-bold text-sm">Meta Webhook Trigger</h3>
      </div>
      <div className="bg-black/50 border border-white/5 rounded-lg p-3 text-xs font-mono text-white/70 overflow-hidden relative group">
        <p className="opacity-50 mb-1" id="webhook-label">Webhook URL:</p>
        <div 
          className="truncate text-green-400/80 pr-6"
          aria-labelledby="webhook-label"
        >
          {url}
        </div>
        <button 
          onClick={copyToClipboard}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Copy Webhook URL"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/70" />}
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-[#0d1530]" />
    </div>
  );
}
