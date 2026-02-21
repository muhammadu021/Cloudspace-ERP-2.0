import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CHART_COLORS } from '@/utils/constants'

const BarChart = ({
  data = [],
  bars = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  colors = CHART_COLORS,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.color || colors[index % colors.length]}
              name={bar.name || bar.dataKey}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart