'use client';

import React, { useEffect, useState } from 'react';
import { departmentAPI } from '../../../lib/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import AdminLayout from '../../layouts/admin-layout';

interface Department {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export default function ManageDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editDept, setEditDept] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await departmentAPI.getAllDepartments({ limit: 100 });
      setDepartments(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.createDepartment(newDept);
      setNewDept({ name: '', description: '' });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (dept: Department) => {
    setEditDeptId(dept._id);
    setEditDept({ name: dept.name, description: dept.description || '' });
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeptId) return;
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.updateDepartment(editDeptId, editDept);
      setEditDeptId(null);
      setEditDept({ name: '', description: '' });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.deleteDepartment(id);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold mb-6 text-[#0E2647] flex items-center gap-2">
          <span>Manage Department</span>
        </h1>
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
          <form onSubmit={handleAddDepartment} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#FAB364] focus:outline-none transition"
                value={newDept.name}
                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                required
                placeholder="Department name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#FAB364] focus:outline-none transition"
                value={newDept.description}
                onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                placeholder="Description (optional)"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#FAB364] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#f89c1e] transition disabled:opacity-60"
              disabled={loading}
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
          {error && <div className="text-red-600 mt-3 font-medium">{error}</div>}
        </div>
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b bg-[#F8F9FB] text-[#0E2647]">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept._id} className="border-b hover:bg-[#FFF7ED] transition">
                  {editDeptId === dept._id ? (
                    <>
                      <td className="p-4">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          value={editDept.name}
                          onChange={e => setEditDept({ ...editDept, name: e.target.value })}
                          required
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          value={editDept.description}
                          onChange={e => setEditDept({ ...editDept, description: e.target.value })}
                        />
                      </td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button
                          onClick={handleEditDepartment}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition font-semibold"
                          disabled={loading}
                        ><Save className="w-4 h-4" />Save</button>
                        <button
                          onClick={() => setEditDeptId(null)}
                          className="flex items-center gap-1 bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition font-semibold"
                          disabled={loading}
                        ><X className="w-4 h-4" />Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-medium text-[#0E2647]">{dept.name}</td>
                      <td className="p-4 text-gray-700">{dept.description}</td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="flex items-center gap-1 bg-[#FAB364] text-white px-4 py-2 rounded-lg shadow hover:bg-[#f89c1e] transition font-semibold"
                          disabled={loading}
                        ><Edit2 className="w-4 h-4" />Edit</button>
                        <button
                          onClick={() => handleDeleteDepartment(dept._id)}
                          className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition font-semibold"
                          disabled={loading}
                        ><Trash2 className="w-4 h-4" />Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-6 text-center text-[#0E2647] font-semibold">Loading...</div>}
          {!loading && departments.length === 0 && <div className="p-6 text-center text-gray-500">No departments found.</div>}
        </div>
      </div>
    </AdminLayout>
  );
} 