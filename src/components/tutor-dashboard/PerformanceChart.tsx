'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { z } from 'zod'

export const performanceChartSchema = z.object({
  data: z.array(z.object({
    date: z.string(),
    score: z.number(),
  })).describe('Array of scores over time'),
})

export function PerformanceChart({ data }: z.infer<typeof performanceChartSchema>) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      <h3 className="font-semibold leading-none tracking-tight mb-4">Student Performance Trend</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
             <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length && label) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {new Date(label).toLocaleDateString()}
                            </span>
                            <span className="font-bold text-foreground">
                              Score: {payload[0].value}
                            </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
