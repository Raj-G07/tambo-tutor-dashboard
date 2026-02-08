"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Search } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getStudents } from "@/app/actions/tutor"
import { CreateStudentFormI } from "@/lib/tambo"

// Helper to format date for graph
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' })
}

export function StudentsView({ isActive }: { isActive: boolean }) {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 5

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getStudents()
            setStudents(data || [])
        } catch (error) {
            console.error("Failed to fetch students", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Process data for activity graph (enrollments per day)
    const enrollmentsPerDay = students.reduce((acc: any, student) => {
        const day = formatDate(student.created_at)
        acc[day] = (acc[day] || 0) + 1
        return acc
    }, {})

    // Sort by date roughly? Or just show as is.
    // Ideally we should sort dates.
    // Filter students by name (in-memory)
    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const graphData = Object.entries(enrollmentsPerDay).map(([day, count]) => ({
        day,
        count,
    }))

    return (
        <div className="space-y-6 pt-4">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                    <p className="text-sm text-muted-foreground">Keep student growth on track.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Cancel" : "Student"}
                </Button>
            </div>

            {isCreating && isActive && (
                <div className="rounded-lg border p-4 shadow-sm bg-white">
                    <CreateStudentFormI defaultValues={{
                        full_name: "Raj Gupta",
                        email: "rajgg998@gmail.com",
                        grade_level: "12th",
                        notes: "Student is weak in history"
                    }} />
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Activity</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData}>
                                    <XAxis
                                        dataKey="day"
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
                                        cursor={{ stroke: '#888888', strokeWidth: 1 }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Data Table Section */}
            {isActive && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Student Directory</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 rounded-xl"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Grade Level</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {searchQuery ? `No students found matching "${searchQuery}"` : "No students found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.full_name}</TableCell>
                                            <TableCell>{student.grade_level || "N/A"}</TableCell>
                                            <TableCell>{student.email || "N/A"}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={student.notes}>{student.notes || ""}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {filteredStudents.length > itemsPerPage && (
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
