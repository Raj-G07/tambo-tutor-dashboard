import { z } from 'zod'
import { createSession, getStudents, getCourses } from '@/app/actions/tutor'
import { Loader2 } from 'lucide-react'
import { useTamboComponentState } from '@tambo-ai/react'
import { useState, useEffect } from 'react'

// Schemas for dropdown options
const optionSchema = z.object({
    id: z.string(),
    label: z.string(),
})

export const createSessionFormSchema = z.object({
    defaultValues: z.object({
        course_id: z.string().optional(),
        student_id: z.string().optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        topic: z.string().optional(),
    }).optional().describe('Default values for the form fields'),
})

type Student = {
    id: string
    full_name: string
}

type Course = {
    id: string
    title: string
}

export function CreateSessionForm({ defaultValues }: z.infer<typeof createSessionFormSchema>) {
    // UI state (local only - not Tambo-visible)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dataLoading, setDataLoading] = useState(true)
    const [students, setStudents] = useState<Student[]>([])
    const [courses, setCourses] = useState<Course[]>([])

    // Form state (Tambo-visible)
    const [formState, setFormState] = useTamboComponentState(
        "session-form",
        {
            course_id: defaultValues?.course_id ?? "",
            student_id: defaultValues?.student_id ?? "",
            start_time: defaultValues?.start_time ?? "",
            end_time: defaultValues?.end_time ?? "",
            topic: defaultValues?.topic ?? "",
        },
        defaultValues
    )

    // Fetch students and courses on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [studentsData, coursesData] = await Promise.all([
                    getStudents(),
                    getCourses()
                ])
                setStudents(studentsData as Student[])
                setCourses(coursesData as Course[])
            } catch (err) {
                console.error('Failed to fetch data:', err)
                setError('Failed to load students and courses')
            } finally {
                setDataLoading(false)
            }
        }
        fetchData()
    }, [])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const course_id = formData.get('course_id') as string
            const student_id = formData.get('student_id') as string
            const start_time = formData.get('start_time') as string
            const end_time = formData.get('end_time') as string
            const topic = formData.get('topic') as string

            if (!course_id || !student_id || !start_time || !end_time) {
                throw new Error('Please fill in all required fields')
            }

            // Ensure ISO format for time if possible, or trust input type="datetime-local" to give standard format
            // datetime-local gives "YYYY-MM-DDTHH:mm", we might need to add seconds/timezone if backend is strict
            // For now, passing as string

            const startIso = new Date(start_time).toISOString();
            const endIso = new Date(end_time).toISOString();

            await createSession({ course_id, student_id, start_time: startIso, end_time: endIso, topic })
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
                <p className="font-medium">Session successfully scheduled!</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-sm underline hover:text-green-800"
                >
                    Schedule another
                </button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-medium">Schedule Session</h3>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid gap-2">
                <label htmlFor="student_id" className="text-sm font-medium">Student *</label>
                {students && students.length > 0 ? (
                    <select
                        id="student_id"
                        name="student_id"
                        defaultValue={defaultValues?.student_id || ''}
                        required
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="" disabled>Select a student</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        id="student_id"
                        name="student_id"
                        defaultValue={defaultValues?.student_id}
                        required
                        placeholder="Student UUID"
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                )}
            </div>

            <div className="grid gap-2">
                <label htmlFor="course_id" className="text-sm font-medium">Course *</label>
                {courses && courses.length > 0 ? (
                    <select
                        id="course_id"
                        name="course_id"
                        defaultValue={defaultValues?.course_id || ''}
                        required
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="" disabled>Select a course</option>
                        {courses.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        id="course_id"
                        name="course_id"
                        defaultValue={defaultValues?.course_id}
                        required
                        placeholder="Course UUID"
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label htmlFor="start_time" className="text-sm font-medium">Start Time *</label>
                    <input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        defaultValue={defaultValues?.start_time}
                        required
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="end_time" className="text-sm font-medium">End Time *</label>
                    <input
                        id="end_time"
                        name="end_time"
                        type="datetime-local"
                        defaultValue={defaultValues?.end_time}
                        required
                        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <label htmlFor="topic" className="text-sm font-medium">Topic</label>
                <input
                    id="topic"
                    name="topic"
                    defaultValue={defaultValues?.topic}
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. Hooks and State"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-black text-white"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Schedule Session
            </button>
        </form>
    )
}
