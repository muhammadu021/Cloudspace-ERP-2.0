import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Printer
} from 'lucide-react';

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const availableReports = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Income statement showing revenues and expenses',
      icon: TrendingUp,
      color: 'text-green-600',
      endpoint: '/reports/profit-loss',
      requiresDateRange: true
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Statement of financial position',
      icon: Building,
      color: 'text-primary',
      endpoint: '/reports/balance-sheet',
      requiresAsOfDate: true
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash receipts and payments',
      icon: DollarSign,
      color: 'text-purple-600',
      endpoint: '/reports/cash-flow',
      requiresDateRange: true
    },
    {
      id: 'trial-balance',
      name: 'Trial Balance',
      description: 'List of all accounts with balances',
      icon: BarChart3,
      color: 'text-orange-600',
      endpoint: '/reports/trial-balance',
      requiresAsOfDate: true
    },
    {
      id: 'general-ledger',
      name: 'General Ledger',
      description: 'Detailed account transactions',
      icon: FileText,
      color: 'text-gray-600',
      endpoint: '/reports/general-ledger',
      requiresDateRange: true
    }
  ];

  useEffect(() => {
    fetchAvailableReports();
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchAvailableReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/finance/reports');
      const data = await response.json();

      if (data.success) {
        setReports(data.data.availableReports);
      } else {
        setError('Failed to fetch available reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch available reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId) => {
    try {
      setReportLoading(true);
      setSelectedReport(reportId);
      
      const report = availableReports.find(r => r.id === reportId);
      if (!report) return;

      let url = `/api/v1/finance${report.endpoint}`;
      const params = new URLSearchParams();

      if (report.requiresDateRange) {
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
      }

      if (report.requiresAsOfDate) {
        params.append('as_of_date', asOfDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReportData({ ...data.data, reportType: reportId, reportName: report.name });
      } else {
        setError('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = (format = 'pdf') => {
    if (!reportData) return;

    // In a real implementation, this would call an export API
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.reportType}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!reportData) return;
    window.print();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderProfitLossReport = (data) => (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h2>
        <p className="text-gray-600">
          For the period {formatDate(data.period.date_from)} to {formatDate(data.period.date_to)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(data.revenue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="text-3xl font-bold text-red-700">{formatCurrency(data.expenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className={`${data.netIncome >= 0 ? 'bg-primary-50' : 'bg-red-50'} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${data.netIncome >= 0 ? 'text-primary' : 'text-red-600'}`}>
                Net Income
              </p>
              <p className={`text-3xl font-bold ${data.netIncome >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
                {formatCurrency(data.netIncome)}
              </p>
            </div>
            {data.netIncome >= 0 ? (
              <CheckCircle className="h-8 w-8 text-primary" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Revenue</span>
            <span className="font-bold text-green-600">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Expenses</span>
            <span className="font-bold text-red-600">({formatCurrency(data.expenses)})</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-900">Net Income</span>
            <span className={`text-lg font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netIncome)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBalanceSheetReport = (data) => (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Balance Sheet</h2>
        <p className="text-gray-600">As of {formatDate(data.asOfDate)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Assets</p>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(data.assets)}</p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Liabilities</p>
              <p className="text-3xl font-bold text-red-700">{formatCurrency(data.liabilities)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Total Equity</p>
              <p className="text-3xl font-bold text-primary-700">{formatCurrency(data.equity)}</p>
            </div>
            <PieChart className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Equation</h3>
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 text-lg">
            <span className="font-bold text-green-600">{formatCurrency(data.assets)}</span>
            <span className="text-gray-500">=</span>
            <span className="font-bold text-red-600">{formatCurrency(data.liabilities)}</span>
            <span className="text-gray-500">+</span>
            <span className="font-bold text-primary">{formatCurrency(data.equity)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Assets = Liabilities + Equity
          </div>
        </div>
      </div>
    </div>
  );

  const renderCashFlowReport = (data) => (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h2>
        <p className="text-gray-600">
          For the period {formatDate(data.period.date_from)} to {formatDate(data.period.date_to)}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Accounts</h3>
        {data.cashAccounts && data.cashAccounts.length > 0 ? (
          <div className="space-y-3">
            {data.cashAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-900">{account.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({account.code})</span>
                </div>
                <span className="font-bold text-primary">
                  {formatCurrency(account.current_balance, account.currency)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
              <span className="text-lg font-bold text-gray-900">Total Cash</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(data.totalCash)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No cash accounts found</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Generate and view financial statements</p>
        </div>
        {reportData && (
          <div className="flex items-center space-x-2">
            <button
              onClick={printReport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h3>
            
            {/* Date Range Filters */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  As of Date
                </label>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Report List */}
            <div className="space-y-2">
              {availableReports.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReport === report.id;
                
                return (
                  <button
                    key={report.id}
                    onClick={() => generateReport(report.id)}
                    disabled={reportLoading}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${reportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${report.color}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report Display */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-96">
            {reportLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Generating report...</span>
              </div>
            ) : reportData ? (
              <div className="p-6">
                {reportData.reportType === 'profit-loss' && renderProfitLossReport(reportData)}
                {reportData.reportType === 'balance-sheet' && renderBalanceSheetReport(reportData)}
                {reportData.reportType === 'cash-flow' && renderCashFlowReport(reportData)}
                {!['profit-loss', 'balance-sheet', 'cash-flow'].includes(reportData.reportType) && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{reportData.reportName}</h3>
                    <p className="text-gray-500">Report data will be displayed here</p>
                    <pre className="mt-4 text-left bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(reportData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-center p-6">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                <p className="text-gray-500">
                  Choose a report from the list to generate and view financial statements
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;