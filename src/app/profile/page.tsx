"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import StudentLayout from "@/app/layouts/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { userAPI } from "@/lib/api";
import { departmentAPI } from '@/lib/api';
import { User, Mail, Phone, Building, Crown, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    departments: [] as string[]
  });
  const [departments, setDepartments] = useState<{_id: string, name: string}[]>([]);

  // Redirect admins to admin profile
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      router.replace("/admin/profile");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        number: user.number || "",
        departments: user.departments?.map(dept => dept._id) || []
      });
    }
  }, [user]);

  useEffect(() => {
    departmentAPI.getActiveDepartments().then(res => {
      setDepartments(res.data.data);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateOwnProfile(formData);
      updateUser(response.data.data);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    return user.role === 'admin' ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
  };

  const getRoleColor = () => {
    return user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0E2647]">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profilePicture || user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl bg-[#0E2647] text-white">
                      {user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {getRoleIcon()}
                  <Badge className={getRoleColor()}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                {user.number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.number}</span>
                  </div>
                )}
                {user.departments && user.departments.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {user.departments.map(dep => dep.name).join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {user.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Profile</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Phone Number</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departments">Departments</Label>
                      <select
                        id="departments"
                        multiple
                        value={formData.departments}
                        onChange={e => setFormData({ ...formData, departments: Array.from(e.target.selectedOptions, option => option.value) })}
                        required
                        className="border rounded px-3 py-2 w-full"
                      >
                        {departments.map(dep => (
                          <option key={dep._id} value={dep._id}>{dep.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-4">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <p className="text-gray-900">{user.number || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Departments</Label>
                      <p className="text-gray-900">
                        {user.departments && user.departments.length > 0
                          ? user.departments.map(dep => dep.name).join(", ")
                          : "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                      <Badge variant={user.isApproved ? "default" : "destructive"}>
                        {user.isApproved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Statistics */}
        {user.role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0E2647]">24</div>
                  <div className="text-sm text-gray-600">Quizzes Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0E2647]">85%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0E2647]">#3</div>
                  <div className="text-sm text-gray-600">Department Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
} 