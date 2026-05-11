import React, { useEffect, useState } from 'react';
import { AlertCircle, Terminal, Info, AlertTriangle, XCircle } from 'lucide-react';
import { createSyncClient } from '@/lib/sync/supabase-client';

interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  action: string;
  details: any;
  created_at: string;
}

export function LiveLogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    const supabase = createSyncClient();

    const fetchInitialLogs = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agent_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        if (mounted && Array.isArray(data)) {
          // Safer validation map
          const safeLogs: LogEntry[] = data.map(item => ({
            id: item.id || '',
            level: item.level as 'info' | 'warning' | 'error',
            action: item.action || '',
            details: item.details || {},
            created_at: item.created_at || new Date().toISOString()
          }));
          setLogs(safeLogs);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchInitialLogs();

    const channel = supabase
      .channel('agent_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_logs' },
        (payload) => {
          if (mounted) {
            setLogs((current) => {
              const newLog = payload.new as unknown as LogEntry;
              return [newLog, ...current].slice(0, 50);
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const getLogIcon = (level: string) => {
    if (level === 'error') return <XCircle className="w-3 h-3 text-red-500" />;
    if (level === 'warning') return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
    return <Info className="w-3 h-3 text-blue-400" />;
  };

  return (
    <div className="flex-1 rounded-2xl border border-white/5 bg-[#0d1530] p-4 flex flex-col h-[300px]">
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <Terminal className="w-5 h-5 text-(--sync-yellow)" />
        <h3 className="font-bold">Live Operations Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center opacity-50 text-sm">
            <p>Waiting for webhook activity...</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="text-xs bg-black/40 border border-white/5 rounded-lg p-2 font-mono break-all">
              <div className="flex items-center gap-2 mb-1">
                {getLogIcon(log.level)}
                <span className="opacity-50">{new Date(log.created_at).toLocaleTimeString()}</span>
                <span className="font-bold text-white/80">{log.action}</span>
              </div>
              <div className="pl-5 text-white/60">
                {JSON.stringify(log.details)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
