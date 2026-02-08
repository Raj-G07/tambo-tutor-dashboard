import { z } from 'zod'
import { createStudent } from '@/app/actions/tutor'
import { Loader2 } from 'lucide-react'
import { useTamboComponentState } from '@tambo-ai/react'
import { useState } from 'react';

export const createStudentFormSchema = z.object({
    defaultValues: z.object({
        full_name: z.string().optional(),
        email: z.string().optional(),
        grade_level: z.string().optional(),
        notes: z.string().optional(),
    }).optional().describe('Default values for the form fields'),
})

export function CreateStudentForm({ defaultValues }: z.infer<typeof createStudentFormSchema>) {
    // UI state (local only - not Tambo-visible)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state (Tambo-visible)
    const [formState, setFormState] = useTamboComponentState(
        "student-form",
        {
            full_name: defaultValues?.full_name ?? "",
            email: defaultValues?.email ?? "",
            grade_level: defaultValues?.grade_level ?? "",
            notes: defaultValues?.notes ?? "",
        },
        defaultValues
    )

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const full_name = formData.get('full_name') as string
            const email = formData.get('email') as string
            const grade_level = formData.get('grade_level') as string
            const notes = formData.get('notes') as string

            if (!full_name) {
                throw new Error('Full Name is required')
            }

            await createStudent({ full_name, email, grade_level, notes })
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
                <p className="font-medium">Student successfully created!</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-sm underline hover:text-green-800"
                >
                    Create another
                </button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-medium">Add New Student</h3>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid gap-2">
                <label htmlFor="full_name" className="text-sm font-medium">Full Name *</label>
                <input
                    id="full_name"
                    name="full_name"
                    defaultValue={defaultValues?.full_name}
                    required
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Jane Doe"
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={defaultValues?.email}
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="jane@example.com"
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="grade_level" className="text-sm font-medium">Grade Level</label>
                <input
                    id="grade_level"
                    name="grade_level"
                    defaultValue={defaultValues?.grade_level}
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="10th Grade"
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    defaultValue={defaultValues?.notes}
                    className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any additional details..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-black text-white"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Student
            </button>
        </form>
    )
}
