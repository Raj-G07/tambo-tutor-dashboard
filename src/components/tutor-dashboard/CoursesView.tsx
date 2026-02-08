"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, BookOpen, Users, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { getCourses, getStudents, deleteCourse } from "@/app/actions/tutor"
import { CreateCourseFormI } from "@/lib/tambo"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip } from "@/components/tambo/suggestions-tooltip"

// Helper to format date for graph
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' })
}

export function CoursesView({ isActive }: { isActive: boolean }) {
    const [courses, setCourses] = useState<any[]>([])
    const [studentCount, setStudentCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 5

    const fetchData = async () => {
        setLoading(true)
        try {
            const [coursesData, studentsData] = await Promise.all([
                getCourses(),
                getStudents(),
            ])
            setCourses(coursesData || [])
            setStudentCount(studentsData?.length || 0)
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        setIsDeleting(true)
        try {
            await deleteCourse(itemToDelete)
            await fetchData()
            setItemToDelete(null)
        } catch (error) {
            console.error("Failed to delete course", error)
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Process data for graph (courses per day)
    const coursesPerDay = courses.reduce((acc: any, course) => {
        const dateKey = formatDate(course.created_at)
        acc[dateKey] = (acc[dateKey] || 0) + 1
        return acc
    }, {})

    // Convert to array and sort chronologically by original timestamp
    const graphData = Object.entries(coursesPerDay).map(([dateLabel, count]) => {
        // Find the earliest course in this group to get a sortable date
        const sampleCourse = courses.find(c => formatDate(c.created_at) === dateLabel)
        return {
            dateLabel,
            count,
            timestamp: sampleCourse ? new Date(sampleCourse.created_at).getTime() : 0
        }
    }).sort((a, b) => a.timestamp - b.timestamp)

    const totalPages = Math.ceil(courses.length / itemsPerPage)
    const paginatedCourses = courses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Stable defaultValues to prevent infinite re-renders
    const courseDefaultValues = useMemo(() => ({
        title: "Web Development ",
        description: "Learn web development from scratch",
        hourly_rate: 50
    }), [])

    return (
        <div className="space-y-8">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-medium tracking-tight text-gray-900">Courses</h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">PERFORMANCE OVERVIEW</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip content={isCreating ? "Cancel" : "Add Course"} side="left">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsCreating(!isCreating)}
                            className={cn(
                                "rounded-2xl w-11 h-11 border-gray-100 shadow-sm transition-all duration-300",
                                isCreating ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100" : "bg-white hover:bg-gray-50 text-gray-600"
                            )}
                        >
                            <Plus className={cn("h-5 w-5 transition-transform duration-300", isCreating && "rotate-45")} />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {isCreating && isActive && (
                <div className="rounded-3xl border border-gray-100 p-6 shadow-sm bg-white animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Create New Course</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCreating(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </Button>
                    </div>
                    <CreateCourseFormI
                        defaultValues={courseDefaultValues}
                    />
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden group hover:border-green-100 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Courses</CardTitle>
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-green-50 transition-colors duration-300">
                            <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Students</CardTitle>
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
                            <Users className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900">{studentCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Courses Created Over Time</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 pt-4">
                    <div className="h-[220px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
                                    <XAxis
                                        dataKey="dateLabel"
                                        stroke="#cbd5e1"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#cbd5e1"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(241, 245, 249, 0.4)', radius: [8, 8, 0, 0] }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            padding: '8px 12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#22c55e"
                                        fillOpacity={0.8}
                                        radius={[8, 8, 0, 0]}
                                        barSize={32}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Data Table Section */}
            {isActive && (
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500">Course List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-50 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Title</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Description</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Hourly Rate</TableHead>
                                    <TableHead className="text-right text-[10px] uppercase font-semibold tracking-wider text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400 text-sm">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCourses.map((course) => (
                                        <TableRow key={course.id} className="group transition-colors hover:bg-gray-50/50 border-gray-50">
                                            <TableCell className="font-medium text-gray-900 py-4">{course.title}</TableCell>
                                            <TableCell className="text-gray-500 max-w-[300px] truncate">{course.description || "—"}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">
                                                <span className="text-xs text-gray-400 mr-0.5">$</span>
                                                {course.hourly_rate?.toFixed(2) || "0.00"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Tooltip content="Quick View" side="top">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Tooltip>
                                                    <DropdownMenu>
                                                        <Tooltip content="More Actions" side="top">
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                        </Tooltip>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-1.5 min-w-[140px]">
                                                            <DropdownMenuItem
                                                                className="rounded-xl px-4 py-2 text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                                onSelect={() => handleDeleteClick(course.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {courses.length > itemsPerPage && (
                            <div className="py-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={page === currentPage}
                                                    onClick={() => setCurrentPage(page)}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Course"
                description="Are you sure you want to delete this course? This action cannot be undone and will remove all associated data."
            />
        </div>
    )
}
