'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SourceData {
  name: string
  value: number
}

interface SourceBreakdownProps {
  data: SourceData[]
}

const COLORS = [
  '#E8258E', // T-Mobile Magenta
  '#7C3E93', // Purple
  '#00A19C', // Teal
  '#F58220', // Orange
  '#4F46E5', // Indigo
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
]

export function SourceBreakdown({ data }: SourceBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }))

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: '600' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5" />

      <div className="relative p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#E8258E] mb-1">Source Breakdown</h3>
          <p className="text-xs text-tmobile-gray-600">
            Distribution of signals across data sources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithPercentage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} signals (${props.payload.percentage}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Source List */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-tmobile-gray-700 mb-4">
              Source Details
            </div>
            {dataWithPercentage.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-tmobile-gray-50 to-white border border-tmobile-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-tmobile-black">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-tmobile-gray-600">
                    {item.value.toLocaleString()} signals
                  </span>
                  <span
                    className="text-sm font-bold min-w-[3rem] text-right"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="pt-3 mt-3 border-t border-tmobile-gray-200">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-tmobile-magenta/5 to-purple-50">
                <span className="text-sm font-bold text-tmobile-black">
                  Total
                </span>
                <span className="text-sm font-bold text-[#E8258E]">
                  {total.toLocaleString()} signals
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
