"use client"

import * as React from "react"
import { z } from "zod"
import { createCourse } from "@/app/actions/tutor"
import { Loader2 } from "lucide-react"
import { useTamboComponentState } from "@tambo-ai/react"

/* ----------------------------------
 * Schema
 * ---------------------------------- */
export const createCourseFormSchema = z.object({
    defaultValues: z.object({
        title: z.string(),
        description: z.string(),
        hourly_rate: z.number(),
    }),
})

/* ----------------------------------
 * Component
 * ---------------------------------- */
export function CreateCourseForm({
    defaultValues,
}: z.infer<typeof createCourseFormSchema>) {
    /* ----------------------------------
     * Tambo-managed form state
     * ---------------------------------- */
    const [formState, setFormState] = useTamboComponentState(
        "course-form",
        {
            title: defaultValues?.title ?? "",
            description: defaultValues?.description ?? "",
            hourly_rate: defaultValues?.hourly_rate ?? null,
        },
        defaultValues,
    )

    /* ----------------------------------
     * UI state (local only - not Tambo-visible)
     * ---------------------------------- */
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    /* ----------------------------------
     * Submit handler
     * ---------------------------------- */
    async function handleSubmit() {
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            if (!formState?.title?.trim()) {
                throw new Error("Title is required")
            }

            await createCourse({
                title: formState?.title?.trim(),
                description: formState?.description?.trim() || undefined,
                hourly_rate: formState?.hourly_rate ?? undefined,
            })

            setSuccess(true)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred"
            )
        } finally {
            setLoading(false)
        }
    }

    /* ----------------------------------
     * Success state
     * ---------------------------------- */
    if (success) {
        return (
            <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
                <p className="font-medium">Course successfully created!</p>
                <button
                    onClick={() => {
                        setSuccess(false)
                        setFormState({
                            title: "",
                            description: "",
                            hourly_rate: 0,
                        })
                    }}
                    className="mt-2 text-sm underline hover:text-green-800"
                >
                    Create another
                </button>
            </div>
        )
    }

    /* ----------------------------------
     * Form UI
     * ---------------------------------- */
    return (
        <form
            action={handleSubmit}
            className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
        >
            <h3 className="text-lg font-medium">Create New Course</h3>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            {/* Title */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Course Title *</label>
                <input
                    value={formState?.title ?? ""}
                    onChange={(e) =>
                        setFormState({
                            title: e.target.value,
                            description: formState?.description ?? "",
                            hourly_rate: formState?.hourly_rate ?? null
                        })
                    }
                    placeholder="Introduction to React"
                    className="h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2"
                />
            </div>

            {/* Description */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={formState?.description ?? ""}
                    onChange={(e) =>
                        setFormState({
                            title: formState?.title ?? "",
                            description: e.target.value,
                            hourly_rate: formState?.hourly_rate ?? null
                        })
                    }
                    placeholder="Course details..."
                    className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2"
                />
            </div>

            {/* Hourly Rate */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Hourly Rate ($)</label>
                <input
                    type="number"
                    step="0.01"
                    value={formState?.hourly_rate ?? ""}
                    onChange={(e) =>
                        setFormState({
                            title: formState?.title ?? "",
                            description: formState?.description ?? "",
                            hourly_rate: e.target.value === "" ? null : Number(e.target.value),
                        })
                    }
                    placeholder="50.00"
                    className="h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md bg-black text-white text-sm font-medium disabled:opacity-50"
            >
                {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                )}
                Create Course
            </button>
        </form>
    )
}
