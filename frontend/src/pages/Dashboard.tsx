import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/api';
import { 
  Activity, 
  CheckCircle2, 
  XOctagon, 
  Clock, 
  Layers,
  TrendingUp,
  RefreshCcw,
  BarChart3,
  ArrowUpRight,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Dashboard = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: statsService.get,
    refetchInterval: 10000, 
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="relative">
          <RefreshCcw className="animate-spin text-brand-600" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-brand-400" size={24} />
          </div>
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Synchronizing Engine Metrics...</p>
      </div>
    );
  }

  const successRate = stats.successfulExecutions + stats.failedExecutions + stats.canceledExecutions > 0 
    ? Math.round((stats.successfulExecutions / (stats.successfulExecutions + stats.failedExecutions + stats.canceledExecutions)) * 100) 
    : 0;

  const chartData = [
    { name: 'Successful', value: stats.successfulExecutions, color: '#10b981' },
    { name: 'Failed', value: stats.failedExecutions, color: '#ef4444' },
    { name: 'In Progress', value: stats.inProgressExecutions, color: '#3b82f6' },
    { name: 'Pending', value: stats.pendingExecutions, color: '#f59e0b' },
    { name: 'Canceled', value: stats.canceledExecutions, color: '#64748b' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-600 text-white rounded-lg shadow-lg shadow-brand-200">
               <ShieldCheck size={20} />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Engine Health</h1>
          </div>
          <p className="text-gray-500 font-medium max-w-md leading-relaxed">
            Real-time observability and neural diagnostics for your automated workflow infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => refetch()}
            className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-widest border-2 border-gray-100 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCcw size={16} className="text-gray-400 group-active:rotate-180 transition-transform duration-500" />
            <span>Sync Stats</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { 
            label: 'Total Library', 
            val: stats.totalWorkflows, 
            icon: Layers, 
            color: 'brand', 
            sub: 'Active blueprints' 
          },
          { 
            label: 'Engine Velocity', 
            val: stats.averageExecutionTimeMs > 1000 
              ? `${(stats.averageExecutionTimeMs / 1000).toFixed(1)}s` 
              : `${stats.averageExecutionTimeMs}ms`, 
            icon: Clock, 
            color: 'blue', 
            sub: 'Avg execution cycle' 
          },
          { 
            label: 'System Integrity', 
            val: `${successRate}%`, 
            icon: TrendingUp, 
            color: 'green', 
            sub: `${stats.successfulExecutions} success / ${stats.failedExecutions} fail / ${stats.canceledExecutions} cancel` 
          },
          { 
            label: 'Active Loads', 
            val: stats.inProgressExecutions + stats.pendingExecutions, 
            icon: Activity, 
            color: 'amber', 
            sub: `${stats.inProgressExecutions} running / ${stats.pendingExecutions} waiting` 
          },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50 shadow-2xl shadow-gray-100/50 relative overflow-hidden group hover:border-brand-100 transition-all duration-500 cursor-default">
            <div className={`absolute -right-4 -top-4 w-28 h-28 bg-${item.color}-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-${item.color}-50/80 text-${item.color}-600 rounded-3xl`}>
                  <item.icon size={28} strokeWidth={2.5} />
                </div>
                <ArrowUpRight size={20} className="text-gray-200 group-hover:text-brand-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</h3>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{item.val}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1.5 uppercase">
                <span className={`w-1.5 h-1.5 rounded-full bg-${item.color}-400`}></span>
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border-2 border-gray-50 shadow-2xl shadow-gray-100/50 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider text-sm">
              <BarChart3 size={22} className="text-brand-600" />
              <span>Execution Volume Distribution</span>
            </h3>
            <div className="flex gap-2">
               {['D', 'W', 'M'].map(t => (
                 <button key={t} className={`w-8 h-8 rounded-lg text-[10px] font-black ${t === 'W' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>{t}</button>
               ))}
            </div>
          </div>
          <div className="p-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '12px 16px'
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-2xl shadow-gray-100/50 p-8 flex flex-col justify-center items-center h-full">
              <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8">System Ratios</h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 w-full gap-4 mt-8">
                 {chartData.map((item, i) => (
                   <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-[11px] font-black text-gray-500 uppercase tracking-tight">{item.name}</span>
                     </div>
                     <span className="text-sm font-black text-gray-900">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div>
               <h4 className="text-2xl font-black tracking-tight mb-2">Operational Command</h4>
               <p className="text-gray-400 font-bold text-sm">Review full execution histories or manage process blueprints.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
               <Link to="/workflows" className="flex-1 md:flex-none px-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gray-100 transition-all text-center">
                 Blueprints
               </Link>
               <Link to="/executions" className="flex-1 md:flex-none px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-900/50 hover:bg-brand-700 transition-all text-center border-t border-brand-400">
                 Executions
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
