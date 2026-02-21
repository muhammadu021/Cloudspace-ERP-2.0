import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  Printer,
  Mail
} from 'lucide-react';
import financeService from '../../services/financeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const FinancialReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('profit-loss');
  
  // Report data
  const [profitLossData, setProfitLossData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  
  // Date filters
  const [dateFilters, setDateFilters] = useState({
    date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    date_to: new Date().toISOString().split('T')[0], // Today
    as_of_date: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    loadReportData();
  }, [activeReport, dateFilters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      switch (activeReport) {
        case 'profit-loss':
          await loadProfitLossReport();
          break;
        case 'balance-sheet':
          await loadBalanceSheetReport();
          break;
        case 'cash-flow':
          await loadCashFlowReport();
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfitLossReport = async () => {
    const response = await financeService.getProfitLossReport({
      date_from: dateFilters.date_from,
      date_to: dateFilters.date_to
    });
    setProfitLossData(response?.data?.data);
  };

  const loadBalanceSheetReport = async () => {
    const response = await financeService.getBalanceSheetReport({
      as_of_date: dateFilters.as_of_date
    });
    setBalanceSheetData(response?.data?.data);
  };

  const loadCashFlowReport = async () => {
    const response = await financeService.getCashFlowReport({
      date_from: dateFilters.date_from,
      date_to: dateFilters.date_to
    });
    setCashFlowData(response?.data?.data);
  };

  const handleExportReport = (format) => {
    // Mock export functionality
    toast.success(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const formatTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const ProfitLossReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {financeService.formatCurrency(profitLossData?.revenue || 0)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <DollarSign className="w-8 h-8 text-green-600" />
                {formatTrend(profitLossData?.revenue, 2000000)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {financeService.formatCurrency(profitLossData?.expenses || 0)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <TrendingDown className="w-8 h-8 text-red-600" />
                {formatTrend(profitLossData?.expenses, 1500000)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${
                  (profitLossData?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {financeService.formatCurrency(profitLossData?.netIncome || 0)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp className="w-8 h-8 text-primary" />
                {formatTrend(profitLossData?.netIncome, 500000)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L */}
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <p className="text-sm text-gray-600">
            For the period {new Date(dateFilters.date_from).toLocaleDateString()} to {new Date(dateFilters.date_to).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-semibold bg-green-50">
                <TableCell>REVENUE</TableCell>
                <TableCell className="text-right text-green-600">
                  {financeService.formatCurrency(profitLossData?.revenue || 0)}
                </TableCell>
                <TableCell className="text-right">100.0%</TableCell>
              </TableRow>
              
              <TableRow className="font-semibold bg-red-50">
                <TableCell>EXPENSES</TableCell>
                <TableCell className="text-right text-red-600">
                  {financeService.formatCurrency(profitLossData?.expenses || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {financeService.calculatePercentage(profitLossData?.expenses, profitLossData?.revenue)}%
                </TableCell>
              </TableRow>
              
              <TableRow className="font-bold border-t-2">
                <TableCell>NET INCOME</TableCell>
                <TableCell className={`text-right ${
                  (profitLossData?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {financeService.formatCurrency(profitLossData?.netIncome || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {financeService.calculatePercentage(profitLossData?.netIncome, profitLossData?.revenue)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const BalanceSheetReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-primary">
                  {financeService.formatCurrency(balanceSheetData?.assets || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-600">
                  {financeService.formatCurrency(balanceSheetData?.liabilities || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equity</p>
                <p className="text-2xl font-bold text-green-600">
                  {financeService.formatCurrency(balanceSheetData?.equity || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Assets</span>
                <span className="font-semibold text-primary">
                  {financeService.formatCurrency(balanceSheetData?.assets || 0)}
                </span>
              </div>
              <Progress value={100} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Liabilities</span>
                <span className="font-semibold text-red-600">
                  {financeService.formatCurrency(balanceSheetData?.liabilities || 0)}
                </span>
              </div>
              <Progress 
                value={financeService.calculatePercentage(
                  balanceSheetData?.liabilities, 
                  balanceSheetData?.assets
                )} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Equity</span>
                <span className="font-semibold text-green-600">
                  {financeService.formatCurrency(balanceSheetData?.equity || 0)}
                </span>
              </div>
              <Progress 
                value={financeService.calculatePercentage(
                  balanceSheetData?.equity, 
                  balanceSheetData?.assets
                )} 
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Balance Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <p className="text-sm text-gray-600">
            As of {new Date(dateFilters.as_of_date).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-semibold bg-primary-50">
                <TableCell>ASSETS</TableCell>
                <TableCell className="text-right text-primary">
                  {financeService.formatCurrency(balanceSheetData?.assets || 0)}
                </TableCell>
                <TableCell className="text-right">100.0%</TableCell>
              </TableRow>
              
              <TableRow className="font-semibold bg-red-50">
                <TableCell>LIABILITIES</TableCell>
                <TableCell className="text-right text-red-600">
                  {financeService.formatCurrency(balanceSheetData?.liabilities || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {financeService.calculatePercentage(balanceSheetData?.liabilities, balanceSheetData?.assets)}%
                </TableCell>
              </TableRow>
              
              <TableRow className="font-semibold bg-green-50">
                <TableCell>EQUITY</TableCell>
                <TableCell className="text-right text-green-600">
                  {financeService.formatCurrency(balanceSheetData?.equity || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {financeService.calculatePercentage(balanceSheetData?.equity, balanceSheetData?.assets)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const CashFlowReport = () => (
    <div className="space-y-6">
      {/* Cash Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Position Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">Total Cash & Cash Equivalents</p>
            <p className="text-3xl font-bold text-green-600">
              {financeService.formatCurrency(cashFlowData?.totalCash || 0)}
            </p>
          </div>
          
          {cashFlowData?.cashAccounts?.length > 0 ? (
            <div className="space-y-3">
              {cashFlowData.cashAccounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-600">{account.bank_name}</p>
                    {account.account_number && (
                      <p className="text-xs text-gray-500">****{account.account_number.slice(-4)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {financeService.formatCurrency(account.current_balance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {financeService.calculatePercentage(account.current_balance, cashFlowData.totalCash)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No cash accounts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Statement Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
          <p className="text-sm text-gray-600">
            For the period {new Date(dateFilters.date_from).toLocaleDateString()} to {new Date(dateFilters.date_to).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Cash Flow Statement</h3>
            <p>Detailed cash flow analysis coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Generate and view comprehensive financial reports</p>
        </div>
        {/* {JSON.stringify({profitLossData,balanceSheetData,cashFlowData})} */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('pdf')} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFilters.date_from}
                onChange={(e) => setDateFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={dateFilters.date_to}
                onChange={(e) => setDateFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="as_of_date">As of Date (Balance Sheet)</Label>
              <Input
                id="as_of_date"
                type="date"
                value={dateFilters.as_of_date}
                onChange={(e) => setDateFilters(prev => ({ ...prev, as_of_date: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={loadReportData}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? 'Loading...' : 'Update Reports'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProfitLossReport />
          )}
        </TabsContent>

        <TabsContent value="balance-sheet">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <BalanceSheetReport />
          )}
        </TabsContent>

        <TabsContent value="cash-flow">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CashFlowReport />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;