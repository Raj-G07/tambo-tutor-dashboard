'use client'

import { z } from 'zod'

export const riskStudentListSchema = z.object({
  students: z.array(z.object({
    id: z.string(),
    full_name: z.string(),
    risk_score: z.number(),
    notes: z.string().nullable(),
  })).describe('List of at-risk students'),
})

export function RiskStudentList({ students }: z.infer<typeof riskStudentListSchema>) {
    if (students.length === 0) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <p className="text-sm font-medium">All clear! No students are currently flagged as high risk.</p>
            </div>
        )
    }

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            ⚠️ Attention Needed
        </h3>
      {students.map((student) => (
        <div key={student.id} className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex justify-between items-start">
                <div>
                   <h4 className="font-medium text-red-900">{student.full_name}</h4>
                   <p className="text-sm text-red-700 mt-1">{student.notes || 'Performance dropping based on recent sessions.'}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-red-600">{student.risk_score}</span>
                    <span className="text-[10px] uppercase text-red-500 font-bold">Risk Score</span>
                </div>
            </div>
        </div>
      ))}
    </div>
  )
}
