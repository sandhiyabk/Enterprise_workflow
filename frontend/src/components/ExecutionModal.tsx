import React, { useState } from 'react';
import { X, Play, Loader2 } from 'lucide-react';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (data: any) => void;
  schema: any;
  workflowName: string;
}

const ExecutionModal: React.FC<ExecutionModalProps> = ({ isOpen, onClose, onExecute, schema, workflowName }) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onExecute(formData);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Run Workflow</h3>
            <p className="text-xs text-gray-500">{workflowName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {Object.entries(schema || {}).map(([key, field]: [string, any]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center">
                  {key}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'string' && field.allowed_values ? (
                  <select 
                    className="input text-sm"
                    required={field.required}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    value={formData[key] || ''}
                  >
                    <option value="">Select an option</option>
                    {field.allowed_values.map((v: string) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                ) : field.type === 'string' ? (
                  <input 
                    type="text"
                    className="input text-sm"
                    required={field.required}
                    placeholder={`Enter ${key}...`}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    value={formData[key] || ''}
                  />
                ) : field.type === 'number' ? (
                  <input 
                    type="number"
                    className="input text-sm"
                    required={field.required}
                    placeholder="0"
                    onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                    value={formData[key] ?? ''}
                  />
                ) : field.type === 'boolean' ? (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange(key, true)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${formData[key] === true ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-400 border-gray-200'}`}
                    >
                      TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange(key, false)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${formData[key] === false ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-400 border-gray-200'}`}
                    >
                      FALSE
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {Object.keys(schema || {}).length === 0 && (
              <div className="text-center py-8 text-gray-400 italic text-sm">
                No input parameters defined for this workflow.
              </div>
            )}
          </div>

          <div className="pt-4 flex space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-grow btn-primary flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              <span>Start Execution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExecutionModal;
