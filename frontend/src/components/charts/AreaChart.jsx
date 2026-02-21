import React from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CHART_COLORS } from '@/utils/constants'

const AreaChart = ({
  data = [],
  areas = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  colors = CHART_COLORS,
  stacked = false,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stackId={stacked ? '1' : area.stackId}
              stroke={area.color || colors[index % colors.length]}
              fill={area.color || colors[index % colors.length]}
              fillOpacity={area.fillOpacity || 0.6}
              name={area.name || area.dataKey}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChart