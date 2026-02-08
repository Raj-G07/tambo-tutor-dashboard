"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Search, Eye, MoreHorizontal } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { cn } from "@/lib/utils"

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
import { getStudents, deleteStudent } from "@/app/actions/tutor"
import { CreateStudentFormI } from "@/lib/tambo"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip } from "@/components/tambo/suggestions-tooltip"
import { Trash2 } from "lucide-react"

// Helper to format date for graph
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' })
}

export function StudentsView({ isActive }: { isActive: boolean }) {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
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

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        setIsDeleting(true)
        try {
            await deleteStudent(itemToDelete)
            await fetchData()
            setItemToDelete(null)
        } catch (error) {
            console.error("Failed to delete student", error)
        } finally {
            setIsDeleting(false)
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
        <div className="space-y-8">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-medium tracking-tight text-gray-900">Students</h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">GROWTH & ENROLLMENT</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip content={isCreating ? "Cancel" : "Add Student"} side="left">
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
                        <h3 className="text-sm font-semibold text-gray-900">Add New Student</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCreating(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </Button>
                    </div>
                    <CreateStudentFormI
                        defaultValues={{
                            full_name: "",
                            email: "",
                            grade_level: "",
                            notes: ""
                        }}
                    />
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Students</CardTitle>
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
                            <Users className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900">{students.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Enrollment Activity</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 pt-4">
                    <div className="h-[220px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData}>
                                    <XAxis
                                        dataKey="day"
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
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            padding: '8px 12px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Data Table Section */}
            {isActive && (
                <Card className="border-gray-100 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-6 border-b border-gray-50">
                        <CardTitle className="text-sm font-medium text-gray-500">Student Directory</CardTitle>
                        <div className="relative w-full max-w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-gray-50/50 border-gray-100 rounded-2xl text-xs focus-visible:ring-green-100 transition-all duration-300"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-50 hover:bg-transparent">
                                    <TableHead className="pl-8 text-[10px] uppercase font-semibold tracking-wider text-gray-400">Full Name</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Grade Level</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Email</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Notes</TableHead>
                                    <TableHead className="text-right pr-8 text-[10px] uppercase font-semibold tracking-wider text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400 text-sm">
                                            {searchQuery ? `No students found matching "${searchQuery}"` : "No students found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <TableRow key={student.id} className="group transition-colors hover:bg-gray-50/50 border-gray-50">
                                            <TableCell className="pl-8 font-medium text-gray-900 py-4">{student.full_name}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                                                    {student.grade_level || "—"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-xs">{student.email || "—"}</TableCell>
                                            <TableCell className="max-w-[150px] truncate text-gray-400 text-xs" title={student.notes}>{student.notes || "—"}</TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Tooltip content="Student Profile" side="top">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
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
                                                                onSelect={() => handleDeleteClick(student.id)}
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
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Student"
                description="Are you sure you want to delete this student? This action cannot be undone and will remove all associated records."
            />
        </div>
    )
}
