'use client'

import { z } from 'zod'

export const studentSummaryCardSchema = z.object({
  student: z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string().nullable(),
    grade_level: z.string().nullable(),
    total_sessions: z.number().optional(),
    risk_score: z.number().optional(),
  }).describe('Student details to display'),
})

export function StudentSummaryCard({ student }: z.infer<typeof studentSummaryCardSchema>) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full max-w-sm">
      <div className="p-6 flex flex-col items-center text-center space-y-2">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-2">
            {student.full_name.charAt(0)}
        </div>
        <h3 className="font-semibold leading-none tracking-tight text-xl">{student.full_name}</h3>
        <p className="text-sm text-muted-foreground">{student.grade_level || 'No Grade Level'}</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t">
            <div className="flex flex-col">
                <span className="text-2xl font-bold">{student.total_sessions || 0}</span>
                <span className="text-xs text-muted-foreground uppercase">Sessions</span>
            </div>
             <div className="flex flex-col">
                <span className={`text-2xl font-bold ${
                    (student.risk_score || 0) > 50 ? 'text-red-500' : 'text-green-500'
                }`}>
                    {student.risk_score || 0}
                </span>
                <span className="text-xs text-muted-foreground uppercase">Risk Score</span>
            </div>
        </div>
      </div>
    </div>
  )
}
