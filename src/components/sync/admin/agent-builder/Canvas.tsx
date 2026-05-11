"use client";

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { PersonaNode } from './nodes/PersonaNode';
import { GuardrailsNode } from './nodes/GuardrailsNode';
import { KnowledgeNode } from './nodes/KnowledgeNode';
import { PoliciesNode } from './nodes/PoliciesNode';
import { ModelNode } from './nodes/ModelNode';

const nodeTypes = {
  trigger: TriggerNode,
  persona: PersonaNode,
  guardrails: GuardrailsNode,
  knowledge: KnowledgeNode,
  policies: PoliciesNode,
  model: ModelNode,
};

const initialNodes: Node[] = [
  { id: 'trigger', type: 'trigger', position: { x: 250, y: 50 }, data: {} },
  { id: 'model', type: 'model', position: { x: 250, y: 200 }, data: { modelName: 'gemini-3.1-pro-preview' } },
  { id: 'persona', type: 'persona', position: { x: 250, y: 350 }, data: { role: 'Sync Support Architect (Customer Service AI)', tone: 'Professional, technical, helpful, friendly, and inquisitive (B2B)' } },
  { id: 'guardrails', type: 'guardrails', position: { x: 250, y: 650 }, data: { rules: '1. Purchase Routing: Always direct customers to official website (https://sync.chameleon.vision/).\n2. Giveaway Awareness: Eagerly share Giveaway link + 4 steps.\n3. Unavailable Services: Politely state coming soon.\n4. B2B Rule: Use the Barter Strategy. Ask for details, strict policies, catalog, and propose exchanging for our premium AI.' } },
  { id: 'knowledge', type: 'knowledge', position: { x: 250, y: 1000 }, data: { context: 'Sync offers premium access to Gemini Pro (Nano Banana, Veo 3.1, Jules, Stitch, Antigravity, Flow, NotebookLM + 5TB Storage).\nPlans: 100-Day (300 EGP / $6.96), 350-Day (500 EGP / $9.69), 18-Month (900 EGP / $16.96).\nGiveaway: 10 Free Subscriptions. Link: https://www.facebook.com/share/p/1CfpSt3LnG/ (Steps: Follow, Like, Comment, DM screenshot).' } },
  { id: 'policies', type: 'policies', position: { x: 250, y: 1350 }, data: { policies: 'Official Website: https://sync.chameleon.vision/\nLanguage: Reply in EXACT language/dialect of sender (mostly Egyptian Arabic or English).\nFormat: Use emojis carefully, bullet points, and bold text.\nNEVER include intro text like "Here is the response". Just output the exact reply.' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-model', source: 'trigger', target: 'model', animated: true, style: { stroke: 'var(--sync-yellow)' } },
  { id: 'e-model-2', source: 'model', target: 'persona', animated: true, style: { stroke: 'var(--sync-yellow)' } },
  { id: 'e2-3', source: 'persona', target: 'guardrails', animated: true, style: { stroke: 'var(--sync-yellow)' } },
  { id: 'e3-4', source: 'guardrails', target: 'knowledge', animated: true, style: { stroke: 'var(--sync-yellow)' } },
  { id: 'e4-5', source: 'knowledge', target: 'policies', animated: true, style: { stroke: 'var(--sync-yellow)' } },
];

interface CanvasProps {
  onStateChange: (nodes: Node[], edges: Edge[]) => void;
  initialState?: { nodes: Node[]; edges: Edge[] };
}

export default function AgentCanvas({ onStateChange, initialState }: CanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(initialState?.nodes || initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialState?.edges || initialEdges);

  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // Propagate changes up whenever nodes/edges change
  useEffect(() => {
    onStateChangeRef.current(nodes, edges);
  }, [nodes, edges]);

  const onNodeDataChange = useCallback((nodeId: string, key: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          // extract field specific from key like "persona_role" or use directly if no underscore
          const field = key.includes('_') ? key.split('_')[1] : key;
          return { ...n, data: { ...n.data, [field]: value } };
        }
        return n;
      })
    );
  }, []);

  // Inject the onChange handler into the nodes
  const nodesWithHandler = useMemo(() => nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onChange: (key: string, value: string) => onNodeDataChange(node.id, key, value)
    }
  })), [nodes, onNodeDataChange]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--sync-yellow)' } }, eds)),
    []
  );

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 relative" style={{ background: '#060b18' }}>
      <ReactFlow
        nodes={nodesWithHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="react-flow-dark"
      >
        <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls className="bg-[#0d1530]! border-white/10! fill-white!" />
      </ReactFlow>
    </div>
  );
}
