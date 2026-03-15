import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Calendar, ClipboardList, CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExecutionList = () => {
  // We'll reuse the axios instance from services/api if possible, 
  // but for simplicity here I'll just use the list logic.
  // Actually, I didn't add a listExecutions to api.ts, I'll add it or just use axios.
  
  const { data: executions, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: async () => {
      // In a real app, I'd have a list endpoint for executions. 
      // Since I didn't define one in the requirements explicitly for "list all", 
      // I'll assume it exists or just use a mock/filtered list.
      // THE USER REQUESTED: GET /executions is not in the list, 
      // but "Audit Log Page" requires it. I'll add it to the backend.
      const { data } = await axios.get('/api/executions'); 
      return data;
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'FAILED': return <XCircle className="text-red-500" size={20} />;
      case 'IN_PROGRESS': return <Clock className="text-blue-500" size={20} />;
      case 'CANCELED': return <AlertCircle className="text-gray-500" size={20} />;
      default: return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
      case 'FAILED': return 'bg-red-50 text-red-700 border-red-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CANCELED': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Execution History</h1>
          <p className="text-gray-500 mt-1">Audit and track every step of your running workflows.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Execution ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Workflow</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Triggered By</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Started</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {executions?.map((exec: any) => (
              <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-medium text-gray-600">{exec.id.slice(0, 8)}...</span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {exec.workflow?.name}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getStatusClass(exec.status)}`}>
                    {getStatusIcon(exec.status)}
                    <span>{exec.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {exec.triggered_by}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                   <div className="flex items-center space-x-1">
                     <Calendar size={14} />
                     <span>{new Date(exec.started_at).toLocaleString()}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <Link 
                    to={`/executions/${exec.id}`}
                    className="flex items-center space-x-1 text-brand-600 font-semibold hover:text-brand-700"
                   >
                     <span>View Logs</span>
                     <ChevronRight size={16} />
                   </Link>
                </td>
              </tr>
            ))}
            {!executions?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <ClipboardList size={40} className="text-gray-300" />
                    <p>No execution history found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutionList;
