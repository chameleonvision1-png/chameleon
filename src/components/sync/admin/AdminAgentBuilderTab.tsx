"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Save, AlertCircle, Loader2, PlayCircle, MessageSquare } from 'lucide-react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import AgentCanvas from './agent-builder/Canvas';
import { SandboxChat } from './agent-builder/SandboxChat';
import { LiveLogsPanel } from './agent-builder/LiveLogsPanel';
import { Node, Edge } from '@xyflow/react';

export default function AdminAgentBuilderTab() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const fetchWorkflow = async () => {
    try {
      const supabase = createSyncClient();
      const { data, error } = await (supabase as any)
        .from('agent_workflows')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setWorkflowId(data.id);
        setIsActive(data.is_active || false);
        if (data.react_flow_state && data.react_flow_state.nodes) {
          setNodes(data.react_flow_state.nodes);
          setEdges(data.react_flow_state.edges);
        }
      }
    } catch (err: any) {
      console.error("Error fetching agent workflow:", err);
      setStatusMessage({ type: 'error', text: 'Failed to load workflow data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const supabase = createSyncClient();
      
      // Extract specific data from nodes for the unified JSON
      const personaNode = nodes.find(n => n.type === 'persona');
      const guardrailsNode = nodes.find(n => n.type === 'guardrails');
      const knowledgeNode = nodes.find(n => n.type === 'knowledge');
      const policiesNode = nodes.find(n => n.type === 'policies');

      const persona = `Role: ${personaNode?.data?.role || ''}\nTone: ${personaNode?.data?.tone || ''}`;
      let guardrails = guardrailsNode?.data?.rules || '';
      if (policiesNode?.data?.policies) {
        guardrails += `\n\n[POLICIES & RULES]\n${policiesNode.data.policies}`;
      }
      const knowledge_base = knowledgeNode?.data?.context || '';

      const payload = {
        name: 'Default Agent',
        trigger_config: { platform: 'meta' },
        persona,
        guardrails,
        knowledge_base,
        react_flow_state: { nodes, edges },
        is_active: isActive
      };

      if (workflowId) {
        const { error } = await (supabase as any).from('agent_workflows').update(payload).eq('id', workflowId);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any).from('agent_workflows').insert(payload).select().single();
        if (error) throw error;
        if (data) setWorkflowId(data.id);
      }

      setStatusMessage({ type: 'success', text: 'Agent configuration saved successfully.' });
    } catch (err: any) {
      console.error("Save error:", err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save agent configuration.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const toggleStatus = async () => {
    if (!workflowId) {
      setStatusMessage({ type: 'error', text: 'Please save the agent configuration first.' });
      return;
    }
    const newStatus = !isActive;
    setIsActive(newStatus);
    try {
      const supabase = createSyncClient();
      const { error } = await (supabase as any).from('agent_workflows').update({ is_active: newStatus }).eq('id', workflowId);
      if (error) throw error;
      setStatusMessage({ type: 'success', text: `Agent is now ${newStatus ? 'active' : 'offline'}.` });
    } catch (err: any) {
      setIsActive(!newStatus); // Revert on failure
      setStatusMessage({ type: 'error', text: err.message || 'Failed to toggle status.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-(--sync-yellow)" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Bot className="w-8 h-8 text-(--sync-yellow)" />
            AI Agent Builder
          </h1>
          <p className="opacity-60 text-sm mt-1">Visually configure the AI Assistant for Facebook/WhatsApp.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {statusMessage && (
            <span className={`text-xs font-bold w-full md:w-auto ${statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {statusMessage.text}
            </span>
          )}
          
          <button 
            onClick={toggleStatus}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all flex-1 md:flex-initial ${isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {isActive ? <PlayCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {isActive ? 'Agent Active' : 'Agent Offline'}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl text-sm font-black flex items-center justify-center gap-2 bg-(--sync-yellow) text-black hover:bg-(--sync-yellow)/90 transition-all disabled:opacity-50 flex-1 md:flex-initial"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Agent
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-250px)] min-h-[600px]">
        {/* Canvas Area - 2/3 width */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 relative bg-[#0d1530] overflow-hidden h-[450px] lg:h-auto">
          <AgentCanvas 
            initialState={nodes.length > 0 ? { nodes, edges } : undefined} 
            onStateChange={(n, e) => { setNodes(n); setEdges(e); }} 
          />
        </div>

        {/* Right Sidebar - Monitoring / Sandbox - 1/3 width */}
        <div className="flex flex-col gap-6">
          <SandboxChat nodes={nodes} />
          <LiveLogsPanel />
        </div>
      </div>
    </div>
  );
}
