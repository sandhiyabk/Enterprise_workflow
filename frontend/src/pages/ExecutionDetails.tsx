import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { executionService, workflowService } from '../services/api';
import ReactFlow, { Background, Controls, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Loader2, 
  ChevronLeft, 
  Play, 
  XOctagon, 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MessageSquare,
  Activity,
  Code,
  Server,
  Database,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useState, useMemo } from 'react';

const nodeTypes = {
  STEP: ({ data }: any) => (
    <div className={`p-3 rounded-xl border-2 transition-all w-48 shadow-sm ${
      data.status === 'COMPLETED' ? 'border-green-500 bg-green-50' : 
      data.status === 'FAILED' ? 'border-red-500 bg-red-50' :
      data.status === 'PENDING' ? 'border-amber-500 bg-amber-50 animate-pulse' :
      'border-gray-200 bg-white opacity-50'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex items-center space-x-2 mb-1">
        <div className={`p-1 rounded-md ${
          data.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
          data.status === 'FAILED' ? 'bg-red-100 text-red-600' :
          'bg-gray-100 text-gray-400'
        }`}>
          {data.step_type === 'APPROVAL' ? <CheckCircle2 size={12} /> : <Activity size={12} />}
        </div>
        <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400">{data.step_type}</span>
      </div>
      <div className="font-bold text-gray-800 text-xs truncate">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
};

const ExecutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [approving, setApproving] = useState(false);

  const { data: execution, isLoading: isExecLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionService.get(id!),
    refetchInterval: (query: any) => {
      const status = query.state.data?.status;
      return (status === 'IN_PROGRESS' || status === 'PENDING') ? 3000 : false;
    }
  });

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['execution-logs', id],
    queryFn: () => executionService.getLogs(id!),
    refetchInterval: (query: any) => {
      const status = execution?.status;
      return (status === 'IN_PROGRESS' || status === 'PENDING') ? 3000 : false;
    }
  });

  const { data: fullWorkflow } = useQuery({
    queryKey: ['workflow', execution?.workflow_id],
    queryFn: () => workflowService.get(execution?.workflow_id!),
    enabled: !!execution?.workflow_id
  });

  const cancelMutation = useMutation({
    mutationFn: () => executionService.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution', id] });
      queryClient.invalidateQueries({ queryKey: ['execution-logs', id] });
    }
  });

  const retryMutation = useMutation({
    mutationFn: () => executionService.retry(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution', id] });
      queryClient.invalidateQueries({ queryKey: ['execution-logs', id] });
    }
  });

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => executionService.approve(id!, { approved, approver_id: 'USER_1' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution', id] });
      queryClient.invalidateQueries({ queryKey: ['execution-logs', id] });
      setApproving(false);
    }
  });

  const nodes = useMemo(() => {
    if (!fullWorkflow?.steps) return [];
    return fullWorkflow.steps.map((step: any, index: number) => {
      const log = logs?.find((l: any) => l.step_name === step.name);
      return {
        id: step.id,
        type: 'STEP',
        position: step.metadata?.position || { x: index * 250, y: 100 },
        data: { 
          label: step.name, 
          step_type: step.step_type,
          status: log?.status || 'NOT_STARTED'
        },
      };
    });
  }, [fullWorkflow, logs]);

  const edges = useMemo(() => {
    if (!fullWorkflow?.steps) return [];
    const _edges: any[] = [];
    fullWorkflow.steps.forEach((step: any) => {
      step.rules?.forEach((rule: any) => {
        if (rule.next_step_id) {
          _edges.push({
            id: `e-${rule.id}`,
            source: step.id,
            target: rule.next_step_id,
            animated: logs?.some((l: any) => l.step_name === step.name && l.status === 'COMPLETED' && l.selected_next_step?.includes(rule.next_step_id)),
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: '#cbd5e1', strokeWidth: 1.5 }
          });
        }
      });
    });
    return _edges;
  }, [fullWorkflow, logs]);

  if ((isExecLoading && !execution) || isLogsLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/executions" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Execution Tracker</h1>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
                execution.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                execution.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-brand-50 text-brand-700 border-brand-200 animate-pulse'
              }`}>
                {execution.status}
              </span>
            </div>
            <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
              Workflow: <span className="text-gray-900 font-bold">{execution.workflow?.name}</span> 
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-400">v{execution.workflow_version}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-mono text-gray-400">ID: {id?.slice(0, 12)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {execution.status === 'IN_PROGRESS' || execution.status === 'PENDING' ? (
            <button 
              onClick={() => cancelMutation.mutate()}
              className="flex-1 md:flex-none px-6 py-2.5 bg-white text-red-600 font-bold rounded-xl border-2 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
              disabled={cancelMutation.isPending}
            >
              <XOctagon size={18} />
              <span>Terminate</span>
            </button>
          ) : execution.status === 'FAILED' ? (
            <button 
              onClick={() => retryMutation.mutate()}
              className="flex-1 md:flex-none px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center space-x-2"
              disabled={retryMutation.isPending}
            >
              <RefreshCcw size={18} />
              <span>Restart Flow</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Visual Map */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden h-64 relative group">
        <div className="absolute top-4 left-6 z-10">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="text-brand-500" size={14} /> Workflow Blueprint
          </h3>
        </div>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        >
          <Background color="#f1f5f9" gap={20} />
        </ReactFlow>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Logs Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-900 flex items-center space-x-3 uppercase tracking-wider text-sm">
                <Activity size={20} className="text-brand-600" />
                <span>Execution Timeline</span>
              </h3>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase">Live Logs</span>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {logs?.length === 0 && (
                <div className="py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-gray-300 mb-4" size={32} />
                  <p className="text-gray-400 font-medium tracking-tight">Initializing execution engine...</p>
                </div>
              )}
              {logs?.map((log: any, index: number) => {
                const evaluatedRules = typeof log.evaluated_rules === 'string' 
                   ? JSON.parse(log.evaluated_rules) 
                   : (log.evaluated_rules || []);
                const metadata = typeof log.metadata === 'string'
                   ? JSON.parse(log.metadata)
                   : (log.metadata || {});
                
                return (
                <div key={log.id} className="relative pl-10 pb-10 last:pb-0 group">
                  {/* Vertical Line */}
                  {index < logs.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-100 group-hover:bg-brand-100 transition-colors"></div>
                  )}
                  
                  {/* Status Ring */}
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-md z-10 transition-all ${
                    log.status === 'COMPLETED' ? 'bg-green-500 scale-110' : 
                    log.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                    log.status === 'FAILED' ? 'bg-red-500' : 'bg-brand-500'
                  } text-white`}>
                    {log.status === 'COMPLETED' ? <CheckCircle2 size={12} strokeWidth={3} /> : 
                     log.status === 'PENDING' ? <Clock size={12} strokeWidth={3} /> : 
                     log.status === 'FAILED' ? <XCircle size={12} strokeWidth={3} /> : <Activity size={12} strokeWidth={3} />}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">{log.step_name}</h4>
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                             log.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' :
                             log.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-gray-100 text-gray-500 border-gray-200'
                           }`}>
                             {log.status === 'PENDING' ? 'AWAITING' : log.status}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                          <Server size={10} /> {log.step_type}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-brand-100">
                          <Clock size={10} strokeWidth={3} />
                          {metadata.duration_ms 
                            ? `${metadata.duration_ms}ms` 
                            : log.ended_at 
                              ? `${Math.round((new Date(log.ended_at).getTime() - new Date(log.started_at).getTime()))}ms` 
                              : 'Computing...'}
                        </span>
                        <span className="text-[9px] text-gray-300 mt-1 font-mono">{new Date(log.started_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {log.error_message && (
                      <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-4 text-red-700 text-sm shadow-inner mt-2">
                        <div className="font-black mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
                          <XOctagon size={16} /> Error Signature
                        </div>
                        <p className="font-bold leading-relaxed">{log.error_message}</p>
                        {metadata.error && (
                          <div className="mt-3">
                            <pre className="text-[10px] bg-red-100/50 p-4 rounded-xl overflow-x-auto text-red-800 font-mono border border-red-200">
                              {JSON.stringify(metadata.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {evaluatedRules.length > 0 && (
                      <div className="bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 mt-4 group/rules hover:border-brand-200 transition-colors">
                         <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4">
                           <Code size={14} className="text-brand-500" />
                           <span>Decision Intelligence</span>
                         </div>
                         <div className="space-y-3">
                           {evaluatedRules.map((rule: any, i: number) => (
                             <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                               rule.isMatch ? 'bg-white border-brand-200 shadow-sm' : 'bg-transparent border-transparent opacity-60'
                             }`}>
                               <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${rule.isMatch ? 'bg-brand-500' : 'bg-gray-300'}`}></div>
                                 <span className="font-mono text-xs text-gray-700 font-bold">{rule.condition}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                 {rule.isMatch && (
                                   <ArrowRight size={14} className="text-brand-500 animate-pulse" />
                                 )}
                                 <span className={`text-[10px] font-black uppercase tracking-tighter ${rule.isMatch ? 'text-brand-600' : 'text-gray-400'}`}>
                                   {rule.isMatch ? 'Selected' : 'Skipped'}
                                 </span>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {log.selected_next_step && (
                      <div className="flex items-center gap-2 mt-4 ml-2">
                        <div className="h-0.5 w-4 bg-gray-200"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Routing To:</span>
                        <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-md border border-brand-100 shadow-sm uppercase tracking-wider">
                          {log.selected_next_step}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )})}
              
              {execution.status === 'PENDING' && (
                <div className="bg-brand-600 rounded-[2rem] p-8 mt-6 shadow-2xl shadow-brand-100 relative overflow-hidden text-white">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-tl-full blur-2xl"></div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-6 gap-6 relative z-10">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md ring-1 ring-white/30">
                      <MessageSquare size={32} strokeWidth={3} />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h4 className="text-2xl font-black tracking-tight uppercase">Manual Action Required</h4>
                      <p className="text-white/80 font-bold mt-2 text-sm leading-relaxed">This business process is waiting for human intervention from the management team to continue.</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-8">
                        <button 
                          onClick={() => approveMutation.mutate(true)}
                          className="bg-white text-brand-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-50 active:scale-95 transition-all shadow-lg"
                          disabled={approveMutation.isPending}
                        >
                          Confirm Approval
                        </button>
                        <button 
                          onClick={() => approveMutation.mutate(false)}
                          className="bg-transparent text-white border-2 border-white/30 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                          disabled={approveMutation.isPending}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Data Card */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black flex items-center space-x-2 text-gray-900 uppercase tracking-wider text-xs">
                <Database size={16} className="text-gray-500" />
                <span>Payload Inspector</span>
              </h3>
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(execution.data, null, 2))}
                className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-1 rounded hover:bg-brand-100"
              >
                Copy JSON
              </button>
            </div>
            <div className="p-6">
               <div className="relative group">
                 <div className="absolute inset-0 bg-brand-50 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                 <pre className="bg-gray-900 text-brand-400 p-5 rounded-2xl text-[11px] font-mono overflow-x-auto shadow-2xl leading-relaxed ring-1 ring-white/10">
                   {JSON.stringify(execution.data, null, 2)}
                 </pre>
               </div>
            </div>
          </div>
          
          {/* Meta Information */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-8 space-y-6">
            <h4 className="font-black text-gray-900 border-b-2 border-gray-50 pb-4 text-xs uppercase tracking-[0.3em]">Lifecycle Meta</h4>
            <div className="grid grid-cols-1 gap-6">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Initialized</span>
                   <span className="text-sm font-black text-gray-800">{new Date(execution.started_at).toLocaleDateString()}</span>
                 </div>
                 <span className="text-xs font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">{new Date(execution.started_at).toLocaleTimeString()}</span>
               </div>
               
               {execution.ended_at && (
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Finalized</span>
                     <span className="text-sm font-black text-gray-800">{new Date(execution.ended_at).toLocaleDateString()}</span>
                   </div>
                   <span className="text-xs font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">{new Date(execution.ended_at).toLocaleTimeString()}</span>
                 </div>
               )}
               
               <div className="pt-4 border-t-2 border-gray-50 flex items-center justify-between">
                 <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Retries Used</span>
                 <div className="flex items-center gap-2">
                   <span className={`text-sm font-black ${execution.retries > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{execution.retries}</span>
                   {execution.retries > 0 && <RefreshCcw size={14} className="text-amber-500 animate-spin-slow" />}
                 </div>
               </div>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl shadow-brand-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
             <h4 className="text-lg font-black uppercase tracking-tight mb-2">Need Assistance?</h4>
             <p className="text-white/80 text-xs font-bold leading-relaxed mb-6">If this execution is stuck or showing persistent failures, contact the technical operations team.</p>
             <button className="w-full bg-white text-brand-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-50 transition-all shadow-xl">
               Contact Dev Support
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetails;
