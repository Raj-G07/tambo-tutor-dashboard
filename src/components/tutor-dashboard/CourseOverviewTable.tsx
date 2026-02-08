'use client'

import { z } from 'zod'

export const courseOverviewTableSchema = z.object({
  courses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    hourly_rate: z.number().nullable(),
    student_count: z.number().optional().describe('Number of students enrolled'),
  })).describe('List of courses'),
})

export function CourseOverviewTable({ courses }: z.infer<typeof courseOverviewTableSchema>) {
  if (!courses || courses.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No courses found.</div>
  }
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hourly Rate</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Students</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {courses.map((course) => (
              <tr key={course.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle font-medium">{course.title}</td>
                <td className="p-4 align-middle text-muted-foreground">{course.description || '-'}</td>
                <td className="p-4 align-middle">
                    {course.hourly_rate ? `$${course.hourly_rate}/hr` : '-'}
                </td>
                 <td className="p-4 align-middle">
                    {course.student_count || 0} 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
