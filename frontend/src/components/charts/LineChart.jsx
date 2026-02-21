import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CHART_COLORS } from '@/utils/constants'

const LineChart = ({
  data = [],
  lines = [],
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
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || colors[index % colors.length]}
              strokeWidth={line.strokeWidth || 2}
              name={line.name || line.dataKey}
              dot={line.showDots !== false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart