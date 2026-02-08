"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, BookOpen, Users } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
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
import { getCourses, getStudents } from "@/app/actions/tutor"
import { CreateCourseFormI } from "@/lib/tambo"

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
        <div className="space-y-6 pt-4">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
                    <p className="text-sm text-muted-foreground">Manage and track your course performance.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Cancel" : "Course"}
                </Button>
            </div>

            {isCreating && isActive && (
                <div className="rounded-lg border p-4 shadow-sm bg-white">
                    <CreateCourseFormI defaultValues={courseDefaultValues} />
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Courses Created Over Time</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
                                    <XAxis
                                        dataKey="dateLabel"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#adfa1d" // Light green/bright aesthetic
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Data Table Section */}
            {isActive && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Hourly Rate</TableHead>
                                    {/* <TableHead className="text-right">Actions</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>{course.description || "N/A"}</TableCell>
                                            <TableCell>${course.hourly_rate?.toFixed(2) || "0.00"}</TableCell>
                                            {/* <TableCell className="text-right">...</TableCell> */}
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
        </div>
    )
}
