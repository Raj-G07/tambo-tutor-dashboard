'use client'

import { z } from 'zod'

export const studentTableSchema = z.object({
  students: z.array(z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string().nullable(),
    grade_level: z.string().nullable(),
    status: z.enum(['active', 'inactive', 'archived']),
    risk_score: z.number(),
  })).describe('List of students to display'),
})

export function StudentTable({ students = [] }: z.infer<typeof studentTableSchema>) {
  if (!students || students.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No students found.</div>
  }
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Grade</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Risk Score</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {students.map((student) => (
              <tr key={student.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle font-medium">{student.full_name}</td>
                <td className="p-4 align-middle">{student.email || '-'}</td>
                <td className="p-4 align-middle">{student.grade_level || '-'}</td>
                <td className="p-4 align-middle">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    student.status === 'active' 
                      ? 'bg-green-50 text-green-700 ring-green-600/20' 
                      : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4 align-middle">
                   <div className="flex items-center gap-2">
                    <div className="h-2 w-full max-w-[60px] rounded-full bg-secondary">
                        <div 
                            className={`h-full rounded-full ${student.risk_score > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${student.risk_score}%` }} 
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">{student.risk_score}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
