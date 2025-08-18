"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Users, BookOpen, Trophy, Plus, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { departmentAPI } from '@/lib/api';
import { authAPI } from '@/lib/api';
import * as XLSX from 'xlsx';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { MultiSelectCombobox } from '@/components/ui/MultiSelectCombobox';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  department?: { _id: string; name: string };
  departments?: { _id: string; name: string }[];
  createdAt: string;
  number?: string;
  avatar?: string;
}

const ManageUsersPage = () => {
  // All hooks must be called unconditionally at the top
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', number: '', password: '', departments: [] as string[], role: '' });
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [adding, setAdding] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', number: '', password: '', departments: [] as string[], role: '' });
  const [updating, setUpdating] = useState(false);
  const [editFormErrors, setEditFormErrors] = useState<{ number?: string; password?: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof User | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const defaultAvatar = '/logo.png'; // Use your default avatar path
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Role-based access control
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push("/dashboard");
    }
  }, [currentUser, authLoading, router]);

  // Fetch users and departments
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.approved = statusFilter === 'approved' ? true : statusFilter === 'not_approved' ? false : undefined;
      if (departmentFilter) params.department = departmentFilter;
      if (searchTerm) params.search = searchTerm;
      const response = await userAPI.getAllUsers({ params });
      setUsers(response.data.data);
      setTotalUsers(response.data.pagination.total);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    departmentAPI.getAllDepartments().then(res => setDepartments(res.data.data)).catch(() => setDepartments([]));
  }, [currentPage, pageSize, roleFilter, statusFilter, departmentFilter, searchTerm, toast]);

  // Only do conditional returns after all hooks
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleApprove = async (userId: string, isApproved: boolean) => {
    try {
      await userAPI.approveUser(userId, isApproved);
      toast({
        title: "Success",
        description: `User ${isApproved ? 'approved' : 'disapproved'} successfully.`,
      });
      fetchUsers(); // Refresh users
    } catch (error) {
      console.error("Failed to approve user", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user approval status.",
      });
    }
  };
  
  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userAPI.deleteUser(userId);
        toast({
          title: "Success",
          description: "User deleted successfully.",
        });
        fetchUsers(); // Refresh users
      } catch (error) {
        console.error("Failed to delete user", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete user.",
        });
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await authAPI.register(newUser);
      toast({ title: 'Success', description: 'User added successfully.' });
      setAddDialogOpen(false);
      setNewUser({ name: '', email: '', number: '', password: '', departments: [] as string[], role: '' });
      fetchUsers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add user.' });
    } finally {
      setAdding(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      number: user.number || '',
      password: '',
      departments: user.departments?.map(dept => dept.name) || [],
      role: user.role || '',
    });
    setEditDialogOpen(true);
  };

  const validateEditForm = () => {
    const errors: { number?: string; password?: string } = {};
    const numberRegex = /^\d{8,15}$/;
    if (!editForm.number) {
      errors.number = 'Number is required.';
    } else if (!numberRegex.test(editForm.number)) {
      errors.number = 'Number must be 8-15 digits.';
    }
    if (editForm.password && editForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!validateEditForm()) return;
    setUpdating(true);
    try {
      const updateData = { ...editForm } as Partial<typeof editForm>;
      if (!editForm.password) {
        delete updateData.password;
      }
      
      // Convert department names back to department IDs for the API
      const departmentIds = editForm.departments
        .map(deptName => departments.find((dept: any) => dept.name === deptName)?._id)
        .filter(Boolean);
      
      await userAPI.updateUser(editingUser._id, {
        ...updateData,
        departments: departmentIds,
      });
      toast({ title: 'Success', description: 'User updated successfully.' });
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user.' });
    } finally {
      setUpdating(false);
    }
  };

  // Sorting logic
  const handleSort = (key: keyof User) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  let filteredUsers = users
    .filter(user =>
      (!roleFilter || user.role === roleFilter) &&
      (!statusFilter || (statusFilter === 'approved' ? user.approved : !user.approved)) &&
      (!departmentFilter || 
        user.department?._id === departmentFilter || 
        user.departments?.some(dept => dept._id === departmentFilter)
      )
    )
    .filter(user => {
      const term = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.number || '').toLowerCase().includes(term)
      );
    });

  if (sortConfig.key) {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      let aValue = a[sortConfig.key!];
      let bValue = b[sortConfig.key!];
      if (sortConfig.key === 'department') {
        aValue = a.departments?.map(dept => dept.name).join(', ') || a.department?.name || '';
        bValue = b.departments?.map(dept => dept.name).join(', ') || b.department?.name || '';
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      return 0;
    });
  }

  const paginatedUsers = users;

  const handleExportExcel = () => {
    const headers = ['Name', 'Number', 'Email', 'Role', 'Status', 'Departments', 'Join Date'];
    const rows = filteredUsers.map(user => [
      user.name,
      user.number || '',
      user.email,
      user.role,
      user.approved ? 'Approved' : 'Not Approved',
      user.departments?.map(dept => dept.name).join(', ') || user.department?.name || '',
      new Date(user.createdAt).toLocaleDateString()
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users.xlsx');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Number</Label>
                  <Input value={newUser.number} onChange={e => setNewUser({ ...newUser, number: e.target.value })} required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                </div>
                <div>
                  <Label>Departments</Label>
                  <MultiSelectCombobox
                    options={departments.map((dept: any) => ({ value: dept.name, label: dept.name }))}
                    value={newUser.departments || []}
                    onChange={vals => setNewUser(u => ({ ...u, departments: vals }))}
                    label="Departments"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="w-full border rounded px-2 py-1" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} required>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add User'}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search by name, email, or number"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border rounded px-2 py-1"
              style={{ minWidth: 220 }}
            />
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }} className="border rounded px-2 py-1">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border rounded px-2 py-1">
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="not_approved">Not Approved</option>
            </select>
            <select value={departmentFilter} onChange={e => { setDepartmentFilter(e.target.value); setCurrentPage(1); }} className="border rounded px-2 py-1">
              <option value="">All Departments</option>
              {departments.map((dept: any) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <Button type="button" onClick={handleExportExcel} variant="outline" className="flex items-center gap-1"><Download className="h-4 w-4" /> Export Excel</Button>
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1">
              {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('number')} className="cursor-pointer">Number {sortConfig.key === 'number' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('email')} className="cursor-pointer">Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('role')} className="cursor-pointer">Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('approved')} className="cursor-pointer">Status {sortConfig.key === 'approved' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('department')} className="cursor-pointer">Departments {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">Join Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <img src={user.avatar || defaultAvatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.number || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="default">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.approved ? 'default' : 'destructive'}>
                          {user.approved ? 'Approved' : 'Not Approved'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.departments && user.departments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.departments.map((dept, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {dept.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>Edit Info</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApprove(user._id, !user.approved)}>
                              {user.approved ? 'Disapprove' : 'Approve'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user._id)} className="text-red-600">Delete Account</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex justify-between items-center mt-4">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Info</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div>
                <Label>Number</Label>
                <Input value={editForm.number} onChange={e => setEditForm({ ...editForm, number: e.target.value })} required aria-invalid={!!editFormErrors.number} aria-describedby="edit-number-error" />
                {editFormErrors.number && (
                  <p id="edit-number-error" className="text-red-500 text-xs mt-1">{editFormErrors.number}</p>
                )}
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave blank to keep current password" aria-invalid={!!editFormErrors.password} aria-describedby="edit-password-error" />
                {editFormErrors.password && (
                  <p id="edit-password-error" className="text-red-500 text-xs mt-1">{editFormErrors.password}</p>
                )}
              </div>
              <div>
                <Label>Departments</Label>
                <MultiSelectCombobox
                  options={departments.map((dept: any) => ({ value: dept.name, label: dept.name }))}
                  value={editForm.departments || []}
                  onChange={vals => setEditForm(f => ({ ...f, departments: vals }))}
                  label="Departments"
                />
              </div>
              <div>
                <Label>Role</Label>
                <select className="w-full border rounded px-2 py-1" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} required>
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updating}>{updating ? 'Updating...' : 'Update User'}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsersPage; 