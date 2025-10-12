import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../ui/Button';

const SalesTeam = () => {
  const { salesPersons, loadSalesPersons, createSalesPerson, updateSalesPerson, deleteSalesPerson } = useAppContext();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', isAvailable: true });
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadSalesPersons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateSalesPerson(editing.id, { ...form, phone: form.mobile });
      setEditing(null);
    } else {
      await createSalesPerson({ name: form.name, email: form.email, mobile: form.mobile, isAvailable: form.isAvailable });
    }
    setForm({ name: '', email: '', mobile: '', isAvailable: true });
    await loadSalesPersons();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sales Team</h2>

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="px-3 py-2 border rounded-lg" placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
        <input className="px-3 py-2 border rounded-lg" placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} />
        <input className="px-3 py-2 border rounded-lg" placeholder="Mobile" value={form.mobile} onChange={(e)=>setForm(f=>({...f,mobile:e.target.value}))} />
        <div className="flex items-center space-x-2">
          <input id="avail" type="checkbox" checked={form.isAvailable} onChange={(e)=>setForm(f=>({...f,isAvailable:e.target.checked}))} />
          <label htmlFor="avail" className="text-sm">Available</label>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <Button type="submit">{editing ? 'Update' : 'Add'} Sales Person</Button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Mobile</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Available</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {salesPersons.map(sp => (
              <tr key={sp.id}>
                <td className="px-4 py-2">{sp.name}</td>
                <td className="px-4 py-2">{sp.email}</td>
                <td className="px-4 py-2">{sp.mobile || sp.phone}</td>
                <td className="px-4 py-2">{(sp.isAvailable ?? sp.available) ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button size="sm" variant="outline" onClick={()=>{ setEditing(sp); setForm({ name: sp.name, email: sp.email, mobile: sp.mobile || sp.phone, isAvailable: (sp.isAvailable ?? sp.available) }); }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={()=>deleteSalesPerson(sp.id).then(loadSalesPersons)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTeam;


