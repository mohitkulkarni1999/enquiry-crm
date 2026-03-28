import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { UIIcons, ActionIcons } from '../ui/Icons';
import Button from '../ui/Button';

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await settingsAPI.getFormConfig();
      setFields(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load form config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateFormConfig(fields);
      toast.success('Form configuration saved!');
    } catch (err) {
      toast.error('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newId = 'custom_' + Math.random().toString(36).substr(2, 9);
    setFields([...fields, { id: newId, type: 'text', label: 'New Field', required: false, isCore: false, options: [] }]);
  };

  const removeField = (index) => {
    const f = fields[index];
    if (f.isCore) {
      toast.error('Cannot remove core fields');
      return;
    }
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const moveField = (index, direction) => {
    if (index === 0 && direction === -1) return;
    if (index === fields.length - 1 && direction === 1) return;
    
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + direction];
    newFields[index + direction] = temp;
    setFields(newFields);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <ActionIcons.loading className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Builder</h2>
          <p className="text-gray-500 text-sm mt-1">Configure the public enquiry form fields.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={addField} variant="secondary" icon={<ActionIcons.add size={16} />}>
            Add Custom Field
          </Button>
          <Button onClick={handleSave} disabled={saving} icon={saving ? <ActionIcons.loading size={16} className="animate-spin" /> : <ActionIcons.check size={16} />}>
            Save Form
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((f, i) => (
          <div key={f.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:shadow-md">
            
            <div className="flex flex-col space-y-2 mt-1">
              <button disabled={i === 0} onClick={() => moveField(i, -1)} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                <UIIcons.chevronUp size={20} />
              </button>
              <button disabled={i === fields.length - 1} onClick={() => moveField(i, 1)} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                <UIIcons.chevronDown size={20} />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Field Label</label>
                <input
                  type="text"
                  value={f.label}
                  onChange={(e) => updateField(i, 'label', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2  bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={f.isCore && (f.id === 'customerName' || f.id === 'customerMobile')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                <select
                  value={f.type}
                  onChange={(e) => updateField(i, 'type', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={f.isCore}
                >
                  <option value="text">Text (Short)</option>
                  <option value="textarea">Textarea (Long)</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="select">Dropdown</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id={`req-${f.id}`}
                  checked={f.required}
                  onChange={(e) => updateField(i, 'required', e.target.checked)}
                  disabled={f.isCore && (f.id === 'customerName' || f.id === 'customerMobile')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor={`req-${f.id}`} className="text-sm font-medium text-gray-700">Required Field</label>
              </div>

              {/* Options for Select - Now available for Core fields too! */}
              {f.type === 'select' && (
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Options (comma separated) {f.isCore && <span className="text-blue-500 font-bold">(Core Field Options)</span>}
                  </label>
                  <input
                    type="text"
                    value={(f.options || []).join(', ')}
                    onChange={(e) => updateField(i, 'options', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>

            <div className="pt-6">
              {!f.isCore && (
                <button onClick={() => removeField(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <ActionIcons.delete size={20} />
                </button>
              )}
              {f.isCore && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Core
                </span>
              )}
            </div>

          </div>
        ))}
      </div>
      
      {fields.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No fields configured.</p>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
