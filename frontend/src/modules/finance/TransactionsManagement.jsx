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
  AlertDescription
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Calendar
} from 'lucide-react';
import financeService from '../../services/financeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const TransactionsManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Form state
  const [transactionForm, setTransactionForm] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit_account_id: '',
    credit_account_id: '',
    amount: '',
    reference_type: '',
    reference_id: '',
    reference_number: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    date_from: new Date().toISOString().split('T')[0], // Today's date
    date_to: new Date().toISOString().split('T')[0],   // Today's date
    account_id: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const accountsResponse = await financeService.getAccounts();
      const accountsData = accountsResponse?.data.data?.accounts || [];
      setAccounts(accountsData);
      if (accountsData.length === 0) {
        toast.error('No accounts found. Please create accounts first.');
      }
    } catch (error) {
      toast.error(`Failed to load accounts: ${error.response?.data?.message || error.message}`);
      console.error('Load initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Clean up filters - remove empty strings to avoid validation errors
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await financeService.getTransactions(cleanedFilters);
      setTransactions(response?.data?.data?.transactions || []);
      setPagination(response?.data?.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error('Load transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    setSelectedTransaction(null);
    setTransactionForm({
      type: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      debit_account_id: '',
      credit_account_id: '',
      amount: '',
      reference_type: '',
      reference_id: '',
      reference_number: ''
    });
    setFormErrors({});
    setShowTransactionDialog(true);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewDialog(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      // Clean up the form data - convert empty strings to null for optional fields
      // For required fields with defaults, omit them if empty to let the backend use defaults
      const cleanedFormData = {
        ...transactionForm,
        // Convert account IDs to integers
        debit_account_id: transactionForm.debit_account_id ? parseInt(transactionForm.debit_account_id) : '',
        credit_account_id: transactionForm.credit_account_id ? parseInt(transactionForm.credit_account_id) : '',
        // Convert amount to number
        amount: transactionForm.amount ? parseFloat(transactionForm.amount) : '',
        reference_type: transactionForm.reference_type || null,
        reference_id: transactionForm.reference_id || null,
        reference_number: transactionForm.reference_number || null
      };
      
      // Remove currency and exchange_rate if empty to let backend use defaults
      if (!transactionForm.currency) {
        delete cleanedFormData.currency;
      }
      if (!transactionForm.exchange_rate) {
        delete cleanedFormData.exchange_rate;
      }

      await financeService.createTransaction(cleanedFormData);
      toast.success('Transaction created successfully');
      
      setShowTransactionDialog(false);
      loadTransactions();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create transaction';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to approve this transaction?')) {
      return;
    }

    try {
      setLoading(true);
      await financeService.approveTransaction(transactionId);
      toast.success('Transaction approved successfully');
      loadTransactions();
    } catch (error) {
      toast.error('Failed to approve transaction');
      console.error('Approve transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      posted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const transactionTypes = [
    { value: 'journal', label: 'Journal Entry' },
    { value: 'payment', label: 'Payment' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' }
  ];

  const referenceTypes = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'bill', label: 'Bill' },
    { value: 'expense', label: 'Expense' },
    { value: 'project', label: 'Project' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'asset', label: 'Asset' },
    { value: 'manual', label: 'Manual Entry' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage financial transactions and journal entries</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={handleCreateTransaction} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Transaction
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {transactionTypes.map((type) => (
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
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  type: '',
                  status: '',
                  date_from: '',
                  date_to: '',
                  account_id: '',
                  page: 1,
                  limit: 10
                })}
                className="flex items-center gap-2"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={loadTransactions}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({pagination.totalItems || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {transaction.transaction_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.reference_number && (
                            <p className="text-sm text-gray-500">
                              Ref: {transaction.reference_number}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {financeService.formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {transaction.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveTransaction(transaction.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Approve Transaction"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Create New Transaction
              
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Transaction Type *</Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value) => setTransactionForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                {formErrors.date && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.date}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Transaction description"
                rows={3}
                required
              />
              {formErrors.description && (
                <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="debit_account_id">Debit Account *</Label>
                <Select
                  value={transactionForm.debit_account_id}
                  onValueChange={(value) => setTransactionForm(prev => ({ ...prev, debit_account_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={accounts.length > 0 ? "Select debit account" : "Loading accounts..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No accounts available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.debit_account_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.debit_account_id}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="credit_account_id">Credit Account *</Label>
                <Select
                  value={transactionForm.credit_account_id}
                  onValueChange={(value) => setTransactionForm(prev => ({ ...prev, credit_account_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={accounts.length > 0 ? "Select credit account" : "Loading accounts..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No accounts available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.credit_account_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.credit_account_id}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
              {formErrors.amount && (
                <p className="text-sm text-red-600 mt-1">{formErrors.amount}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reference_type">Reference Type</Label>
                <Select
                  value={transactionForm.reference_type}
                  onValueChange={(value) => setTransactionForm(prev => ({ ...prev, reference_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={transactionForm.reference_number}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="e.g., INV-001"
                />
              </div>
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
                onClick={() => setShowTransactionDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Transaction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Number</Label>
                  <p className="font-mono text-sm">{selectedTransaction.transaction_number}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p>{selectedTransaction.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.type}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Debit Account</Label>
                  <p>
                    {selectedTransaction.DebitAccount?.code} - {selectedTransaction.DebitAccount?.name}
                  </p>
                </div>
                <div>
                  <Label>Credit Account</Label>
                  <p>
                    {selectedTransaction.CreditAccount?.code} - {selectedTransaction.CreditAccount?.name}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Amount</Label>
                <p className="text-2xl font-bold">
                  {financeService.formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              
              {selectedTransaction.reference_number && (
                <div>
                  <Label>Reference</Label>
                  <p>{selectedTransaction.reference_type}: {selectedTransaction.reference_number}</p>
                </div>
              )}
              
              {selectedTransaction.CreatedBy && (
                <div>
                  <Label>Created By</Label>
                  <p>
                    {selectedTransaction.CreatedBy.User?.first_name} {selectedTransaction.CreatedBy.User?.last_name}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsManagement;