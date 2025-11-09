'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface VelocityData {
  name: string
  growing: number
  stable: number
  declining: number
  color: string
}

interface IssueVelocityChartProps {
  data?: VelocityData[]
}

export function IssueVelocityChart({ data = [] }: IssueVelocityChartProps) {
  // Default data if none provided
  const defaultData: VelocityData[] = [
    { name: 'Network', growing: 0, stable: 0, declining: 0, color: '#E8258E' },
    { name: 'Mobile App', growing: 0, stable: 0, declining: 0, color: '#7C3E93' },
    { name: 'Billing', growing: 0, stable: 0, declining: 0, color: '#00A19C' },
    { name: 'Home Internet', growing: 0, stable: 0, declining: 0, color: '#F58220' },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5" />

      <div className="relative">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#E8258E] mb-1">Issue Velocity</h3>
          <p className="text-xs text-tmobile-gray-600">
            Track how issues are trending across product areas
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Number of Issues', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />
            <Bar
              dataKey="declining"
              stackId="a"
              fill="#00A19C"
              name="Declining"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="stable"
              stackId="a"
              fill="#737373"
              name="Stable"
            />
            <Bar
              dataKey="growing"
              stackId="a"
              fill="#C4262E"
              name="Growing"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend Explanation */}
        <div className="mt-4 pt-4 border-t border-tmobile-gray-200">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#C4262E]" />
              <div>
                <p className="font-semibold text-red-700">Growing</p>
                <p className="text-tmobile-gray-600">+20% velocity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#737373]" />
              <div>
                <p className="font-semibold text-gray-700">Stable</p>
                <p className="text-tmobile-gray-600">±20% velocity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#00A19C]" />
              <div>
                <p className="font-semibold text-teal-700">Declining</p>
                <p className="text-tmobile-gray-600">-20% velocity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
