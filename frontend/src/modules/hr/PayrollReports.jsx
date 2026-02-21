import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
  Separator
} from '@/components/ui';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  PieChart,
  FileText,
  Calculator,
  Globe,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PayrollReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    trends: [],
    departmentStats: [],
    taxAnalysis: [],
    complianceMetrics: {},
    costAnalysis: {}
  });

  // Filters
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    quarter: '',
    month: '',
    department_id: '',
    employee_type: '',
    currency: 'USD'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrollAnalytics(filters);
      
      // Mock comprehensive analytics data
      setAnalyticsData({
        overview: {
          totalPayroll: 2450000,
          totalEmployees: 142,
          avgSalary: 17254,
          payrollGrowth: 8.5,
          totalTaxes: 367500,
          totalDeductions: 245000,
          netPayroll: 1837500,
          complianceScore: 98.5
        },
        trends: [
          { month: 'Jan', gross: 2200000, net: 1650000, taxes: 330000, deductions: 220000 },
          { month: 'Feb', gross: 2250000, net: 1687500, taxes: 337500, deductions: 225000 },
          { month: 'Mar', gross: 2300000, net: 1725000, taxes: 345000, deductions: 230000 },
          { month: 'Apr', gross: 2350000, net: 1762500, taxes: 352500, deductions: 235000 },
          { month: 'May', gross: 2400000, net: 1800000, taxes: 360000, deductions: 240000 },
          { month: 'Jun', gross: 2450000, net: 1837500, taxes: 367500, deductions: 245000 }
        ],
        departmentStats: [
          { department: 'Engineering', employees: 45, totalCost: 980000, avgSalary: 21778, growth: 12.3 },
          { department: 'Sales', employees: 32, totalCost: 640000, avgSalary: 20000, growth: 8.7 },
          { department: 'Marketing', employees: 28, totalCost: 420000, avgSalary: 15000, growth: 6.2 },
          { department: 'HR', employees: 15, totalCost: 225000, avgSalary: 15000, growth: 4.1 },
          { department: 'Finance', employees: 22, totalCost: 330000, avgSalary: 15000, growth: 5.8 }
        ],
        taxAnalysis: [
          { taxType: 'Federal Income Tax', amount: 147000, rate: 6.0, employees: 142 },
          { taxType: 'Social Security', amount: 151900, rate: 6.2, employees: 142 },
          { taxType: 'Medicare', amount: 35525, rate: 1.45, employees: 142 },
          { taxType: 'State Tax', amount: 24500, rate: 1.0, employees: 142 },
          { taxType: 'Unemployment', amount: 8575, rate: 0.35, employees: 142 }
        ],
        complianceMetrics: {
          onTimePayments: 98.5,
          taxFilingAccuracy: 99.2,
          reportingCompliance: 97.8,
          auditReadiness: 96.5,
          dataAccuracy: 99.1
        },
        costAnalysis: {
          salaryBudgetUtilization: 87.3,
          benefitsCostRatio: 23.5,
          overtimeCostRatio: 8.2,
          payrollProcessingCost: 2.1,
          complianceCost: 1.8
        }
      });
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Load analytics data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (reportType) => {
    toast.info(`Exporting ${reportType} report...`);
    // Implement export logic
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: filters.currency
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive payroll analytics, compliance reports, and insights</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => handleExportReport('comprehensive')}>
            <Download className="w-4 h-4" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="filter_year">Year</Label>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_quarter">Quarter</Label>
              <Select
                value={filters.quarter}
                onValueChange={(value) => setFilters(prev => ({ ...prev, quarter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Quarters</SelectItem>
                  <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_month">Month</Label>
              <Select
                value={filters.month}
                onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = new Date(2024, i).toLocaleDateString('en', { month: 'long' });
                    return (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {month}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_department">Department</Label>
              <Select
                value={filters.department_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="1">Engineering</SelectItem>
                  <SelectItem value="2">Sales</SelectItem>
                  <SelectItem value="3">Marketing</SelectItem>
                  <SelectItem value="4">HR</SelectItem>
                  <SelectItem value="5">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_employee_type">Employee Type</Label>
              <Select
                value={filters.employee_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, employee_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_currency">Currency</Label>
              <Select
                value={filters.currency}
                onValueChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Tax Analysis
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Cost Analysis
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analyticsData.overview.totalPayroll)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">+{formatPercentage(analyticsData.overview.payrollGrowth)}</span>
                  <span className="text-gray-500">vs last period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {analyticsData.overview.totalEmployees}
                </div>
                <div className="text-sm text-gray-500">
                  Active employees
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Average Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analyticsData.overview.avgSalary)}
                </div>
                <div className="text-sm text-gray-500">
                  Per employee
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(analyticsData.overview.complianceScore)}
                </div>
                <div className="text-sm text-gray-500">
                  Overall compliance
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gross Payroll</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(analyticsData.overview.totalPayroll)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Taxes</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(analyticsData.overview.totalTaxes)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Deductions</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(analyticsData.overview.totalDeductions)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Net Payroll</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(analyticsData.overview.netPayroll)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('payroll-summary')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export Payroll Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('tax-report')}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Export Tax Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('compliance-report')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Export Compliance Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('year-end-report')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Export Year-End Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2">
                  {analyticsData.trends.map((trend, index) => {
                    const maxGross = Math.max(...analyticsData.trends.map(t => t.gross));
                    const grossHeight = (trend.gross / maxGross) * 100;
                    const netHeight = (trend.net / maxGross) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{trend.month}</div>
                        <div className="w-full bg-gray-200 rounded-t" style={{ height: '80px' }}>
                          <div 
                            className="w-full bg-green-500 rounded-t transition-all duration-300" 
                            style={{ 
                              height: `${grossHeight}%`,
                              marginTop: `${100 - grossHeight}%`
                            }}
                            title={`Gross: ${formatCurrency(trend.gross)}`}
                          />
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {formatCurrency(trend.gross / 1000)}K
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-sm text-gray-500">
                  Monthly gross payroll trends
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departmentStats.map((dept, index) => {
                  const maxCost = Math.max(...analyticsData.departmentStats.map(d => d.totalCost));
                  const costPercentage = (dept.totalCost / maxCost) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{dept.department}</span>
                          <Badge variant="outline">{dept.employees} employees</Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(dept.totalCost)}</div>
                          <div className="text-sm text-gray-500">
                            Avg: {formatCurrency(dept.avgSalary)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${costPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {dept.growth > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={dept.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatPercentage(Math.abs(dept.growth))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Analysis Tab */}
        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.taxAnalysis.map((tax, index) => {
                  const maxAmount = Math.max(...analyticsData.taxAnalysis.map(t => t.amount));
                  const percentage = (tax.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{tax.taxType}</span>
                          <Badge variant="outline">{formatPercentage(tax.rate)}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(tax.amount)}</div>
                          <div className="text-sm text-gray-500">
                            {tax.employees} employees
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analyticsData.complianceMetrics).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold">{formatPercentage(value)}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analyticsData.costAnalysis).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold">{formatPercentage(value)}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollReports;