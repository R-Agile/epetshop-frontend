import { useState } from 'react';
import { Search, MoreVertical, UserCheck, UserX, Ban, Mail } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminUsers = () => {
  const { users, updateUserStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-600';
      case 'banned': return 'bg-red-500/20 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage customer accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center font-medium">{user.totalOrders}</TableCell>
                  <TableCell className="text-right font-medium">
                    Rs. {user.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusStyle(user.status)}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'active')}>
                          <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'inactive')}>
                          <UserX className="w-4 h-4 mr-2 text-yellow-500" />
                          Set Inactive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => updateUserStatus(user.id, 'banned')}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Inactive Users</p>
            <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'inactive').length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Banned Users</p>
            <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'banned').length}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
