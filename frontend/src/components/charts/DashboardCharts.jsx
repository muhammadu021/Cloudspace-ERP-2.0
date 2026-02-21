import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Color palette
const COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  teal: ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1'],
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart Component
export const DashboardLineChart = ({ data, dataKeys, title, height = 300, colors = COLORS.primary }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {dataKeys.map((key, index) => (
            <Line
              key={key.key}
              type="monotone"
              dataKey={key.key}
              name={key.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart Component
export const DashboardBarChart = ({ data, dataKeys, title, height = 300, colors = COLORS.primary, stacked = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {dataKeys.map((key, index) => (
            <Bar
              key={key.key}
              dataKey={key.key}
              name={key.name}
              fill={colors[index % colors.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area Chart Component
export const DashboardAreaChart = ({ data, dataKeys, title, height = 300, colors = COLORS.primary, stacked = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key.key} id={`color${key.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {dataKeys.map((key, index) => (
            <Area
              key={key.key}
              type="monotone"
              dataKey={key.key}
              name={key.name}
              stroke={colors[index % colors.length]}
              fillOpacity={1}
              fill={`url(#color${key.key})`}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
export const DashboardPieChart = ({ data, dataKey = 'value', nameKey = 'name', title, height = 300, colors = COLORS.primary, showPercentage = true }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Donut Chart Component
export const DashboardDonutChart = ({ data, dataKey = 'value', nameKey = 'name', title, height = 300, colors = COLORS.primary }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combined Chart Component (Line + Bar)
export const DashboardComboChart = ({ data, lineKeys, barKeys, title, height = 300 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {barKeys.map((key, index) => (
            <Bar
              key={key.key}
              dataKey={key.key}
              name={key.name}
              fill={COLORS.primary[index % COLORS.primary.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
          {lineKeys.map((key, index) => (
            <Line
              key={key.key}
              type="monotone"
              dataKey={key.key}
              name={key.name}
              stroke={COLORS.success[index % COLORS.success.length]}
              strokeWidth={2}
              dot={{ fill: COLORS.success[index % COLORS.success.length], r: 4 }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Export all colors for use in other components
export { COLORS };

// Default export with all chart types
export default {
  LineChart: DashboardLineChart,
  BarChart: DashboardBarChart,
  AreaChart: DashboardAreaChart,
  PieChart: DashboardPieChart,
  DonutChart: DashboardDonutChart,
  ComboChart: DashboardComboChart,
  COLORS,
};
