'use client'

import { z } from 'zod'

export const sessionTimelineSchema = z.object({
  sessions: z.array(z.object({
    id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    status: z.enum(['scheduled', 'completed', 'cancelled']),
    topic: z.string().nullable(),
    student: z.object({ full_name: z.string() }).nullable(), // Joined data
    course: z.object({ title: z.string() }).nullable(), // Joined data
  })).describe('List of sessions ordered by time'),
})

export function SessionTimeline({ sessions }: z.infer<typeof sessionTimelineSchema>) {
  if (sessions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No upcoming sessions.</div>
  }

  return (
    <div className="space-y-8">
      {sessions.map((session, i) => (
        <div key={session.id} className="flex gap-4">
           {/* Simple timeline line visualization */}
          <div className="flex flex-col items-center">
            <div className="h-full w-px bg-border group-last:hidden" />
          </div>
          <div className="flex-1 pb-8 space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {new Date(session.start_time).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                    session.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    session.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                    {session.status}
                </span>
            </div>
            <h4 className="font-medium leading-none">{session.course?.title || 'Untitled Session'}</h4>
            <p className="text-sm text-muted-foreground">with {session.student?.full_name}</p>
            {session.topic && (
                <div className="mt-2 text-sm bg-muted/50 p-2 rounded text-muted-foreground">
                    Topic: {session.topic}
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
