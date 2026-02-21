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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3
} from 'lucide-react';
import financeService from '../../services/financeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ChartOfAccounts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'hierarchy'

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
    is_active: '' // Show all accounts by default
  });

  const [formErrors, setFormErrors] = useState({});
  const [accountSummary, setAccountSummary] = useState({});

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
    calculateSummary();
  }, [accounts, filters]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await financeService.getAccounts();
      const accountsData = response?.data.data?.accounts || [];
      setAccounts(accountsData);
    } catch (error) {
      console.error('Load accounts error:', error);
      toast.error(`Failed to load accounts: ${error.response?.data?.message || error.message}`);
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

  const calculateSummary = () => {
    const summary = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = {
          count: 0,
          totalBalance: 0,
          activeCount: 0
        };
      }
      
      acc[account.type].count++;
      acc[account.type].totalBalance += parseFloat(account.current_balance || 0);
      
      if (account.is_active) {
        acc[account.type].activeCount++;
      }
      
      return acc;
    }, {});
    
    setAccountSummary(summary);
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

      // Clean up the form data - convert empty strings to null for optional fields
      const cleanedFormData = {
        ...accountForm,
        parent_account_id: accountForm.parent_account_id || null,
        subtype: accountForm.subtype || null,
        bank_name: accountForm.bank_account ? accountForm.bank_name : null,
        account_number: accountForm.bank_account ? accountForm.account_number : null,
        routing_number: accountForm.bank_account ? accountForm.routing_number : null
      };
      
      // Remove normal_balance from the data - let backend auto-set it based on account type
      delete cleanedFormData.normal_balance;

      if (isEditing) {
        await financeService.updateAccount(selectedAccount.id, cleanedFormData);
        toast.success('Account updated successfully');
      } else {
        await financeService.createAccount(cleanedFormData);
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
      revenue: TrendingUp,
      expense: TrendingDown
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

  const renderAccountSummary = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {accountTypes.map((type) => {
          const summary = accountSummary[type.value] || { count: 0, totalBalance: 0, activeCount: 0 };
          const TypeIcon = getAccountTypeIcon(type.value);
          
          return (
            <Card key={type.value} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{type.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {summary.activeCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {financeService.formatCurrency(summary.totalBalance)}
                    </div>
                  </div>
                  <Badge className={financeService.getAccountTypeColor(type.value)}>
                    {summary.count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your company's chart of accounts</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'hierarchy' : 'list')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'list' ? 'Hierarchy View' : 'List View'}
          </Button>
          
          <Button onClick={handleCreateAccount} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Account
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      {renderAccountSummary()}

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
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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
                          
                          {!account.is_system && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
                  onValueChange={(value) => {
                    // Auto-set normal_balance based on account type
                    const normalBalance = ['asset', 'expense'].includes(value) ? 'debit' : 'credit';
                    setAccountForm(prev => ({ ...prev, type: value, subtype: '', normal_balance: normalBalance }));
                  }}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="normal_balance">Normal Balance (Auto-set)</Label>
                <Input
                  id="normal_balance"
                  value={accountForm.normal_balance || 'Select account type first'}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically set based on account type
                </p>
              </div>
              
              <div>
                <Label htmlFor="parent_account">Parent Account (Optional)</Label>
                <Select
                  value={accountForm.parent_account_id}
                  onValueChange={(value) => setAccountForm(prev => ({ ...prev, parent_account_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent Account</SelectItem>
                    {accounts
                      .filter(account => account.id !== selectedAccount?.id) // Don't allow self as parent
                      .filter(account => account.type === accountForm.type) // Only same type accounts
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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

export default ChartOfAccounts;