import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Switch
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react';
import financeService from '../../services/financeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AccountsManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: '',
    subtype: '',
    parent_account_id: '',
    normal_balance: 'debit',
    description: '',
    bank_account: false,
    bank_name: '',
    account_number: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    is_active: 'true'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, filters]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await financeService.getAccounts();
      setAccounts(response?.data?.data?.accounts || []);
    } catch (error) {
      toast.error('Failed to load accounts');
      console.error('Load accounts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = [...accounts];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchTerm) ||
        account.code.toLowerCase().includes(searchTerm) ||
        account.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(account => account.type === filters.type);
    }

    // Active filter
    if (filters.is_active !== '') {
      const isActive = filters.is_active === 'true';
      filtered = filtered.filter(account => account.is_active === isActive);
    }

    setFilteredAccounts(filtered);
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setIsEditing(false);
    setAccountForm({
      code: '',
      name: '',
      type: '',
      subtype: '',
      parent_account_id: '',
      normal_balance: 'debit',
      description: '',
      bank_account: false,
      bank_name: '',
      account_number: ''
    });
    setFormErrors({});
    setShowAccountDialog(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setIsEditing(true);
    setAccountForm({
      code: account.code || '',
      name: account.name || '',
      type: account.type || '',
      subtype: account.subtype || '',
      parent_account_id: account.parent_account_id || '',
      normal_balance: account.normal_balance || 'debit',
      description: account.description || '',
      bank_account: account.bank_account || false,
      bank_name: account.bank_name || '',
      account_number: account.account_number || ''
    });
    setFormErrors({});
    setShowAccountDialog(true);
  };

  const handleSubmitAccount = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      if (isEditing) {
        await financeService.updateAccount(selectedAccount.id, accountForm);
        toast.success('Account updated successfully');
      } else {
        await financeService.createAccount(accountForm);
        toast.success('Account created successfully');
      }
      
      setShowAccountDialog(false);
      loadAccounts();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save account';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await financeService.deleteAccount(accountId);
      toast.success('Account deleted successfully');
      loadAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
      console.error('Delete account error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      asset: DollarSign,
      liability: CreditCard,
      equity: Building,
      revenue: DollarSign,
      expense: CreditCard
    };
    return icons[type] || DollarSign;
  };

  const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expense' }
  ];

  const assetSubtypes = [
    { value: 'current', label: 'Current Asset' },
    { value: 'fixed', label: 'Fixed Asset' },
    { value: 'intangible', label: 'Intangible Asset' }
  ];

  const liabilitySubtypes = [
    { value: 'current', label: 'Current Liability' },
    { value: 'long_term', label: 'Long-term Liability' }
  ];

  const getSubtypeOptions = (type) => {
    switch (type) {
      case 'asset':
        return assetSubtypes;
      case 'liability':
        return liabilitySubtypes;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your company's chart of accounts</p>
        </div>
        
        <Button onClick={handleCreateAccount} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Account
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search accounts..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.is_active}
                onValueChange={(value) => setFilters(prev => ({ ...prev, is_active: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                  <SelectItem value="">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={loadAccounts}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => {
                  const TypeIcon = getAccountTypeIcon(account.type);
                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <span className="font-mono font-medium">{account.code}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{account.name}</p>
                            {account.bank_account && (
                              <p className="text-sm text-gray-500">{account.bank_name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={financeService.getAccountTypeColor(account.type)}>
                          {account.type}
                        </Badge>
                        {account.subtype && (
                          <Badge variant="outline" className="ml-1">
                            {account.subtype}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {financeService.formatCurrency(account.current_balance || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                            title="Edit Account"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Account Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Account' : 'Create New Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Account Code *</Label>
                <Input
                  id="code"
                  value={accountForm.code}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., 1000"
                  required
                />
                {formErrors.code && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.code}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash in Bank"
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Account Type *</Label>
                <Select
                  value={accountForm.type}
                  onValueChange={(value) => setAccountForm(prev => ({ ...prev, type: value, subtype: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.type}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="subtype">Subtype</Label>
                <Select
                  value={accountForm.subtype}
                  onValueChange={(value) => setAccountForm(prev => ({ ...prev, subtype: value }))}
                  disabled={!accountForm.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubtypeOptions(accountForm.type).map((subtype) => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="normal_balance">Normal Balance</Label>
              <Select
                value={accountForm.normal_balance}
                onValueChange={(value) => setAccountForm(prev => ({ ...prev, normal_balance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={accountForm.description}
                onChange={(e) => setAccountForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Account description"
                rows={3}
              />
            </div>

            {/* Bank Account Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={accountForm.bank_account}
                  onCheckedChange={(checked) => setAccountForm(prev => ({ ...prev, bank_account: checked }))}
                />
                <Label>This is a bank account</Label>
              </div>

              {accountForm.bank_account && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={accountForm.bank_name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="e.g., First Bank"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={accountForm.account_number}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, account_number: e.target.value }))}
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Errors */}
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors above and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAccountDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Account' : 'Create Account')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsManagement;