"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar, Filter, Eye, MoreHorizontal, Trash2 } from "lucide-react"
// Ensure lucide-react is available or use text
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { getSessions, deleteSession } from "@/app/actions/tutor"
import { CreateSessionFormI } from "@/lib/tambo"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Helper to format date for display
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('default', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    })
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric', minute: '2-digit'
    })
}

import { Tooltip } from "@/components/tambo/suggestions-tooltip"

export function SessionsView({ isActive }: { isActive: boolean }) {
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [activeFilter, setActiveFilter] = useState("All")
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 5

    useEffect(() => {
        setCurrentPage(1)
    }, [activeFilter])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getSessions()
            setSessions(data || [])
        } catch (error) {
            console.error("Failed to fetch sessions", error)
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
            await deleteSession(itemToDelete)
            await fetchData()
            setItemToDelete(null)
        } catch (error) {
            console.error("Failed to delete session", error)
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // 1. In-memory filtering logic
    const now = new Date()
    const filteredSessions = sessions.filter(session => {
        if (activeFilter === "All") return true

        const startTime = new Date(session.start_time)
        const endTime = new Date(session.end_time)

        if (activeFilter === "Active") {
            return session.status === 'scheduled' && now >= startTime && now <= endTime
        }
        if (activeFilter === "Upcoming") {
            return session.status === 'scheduled' && now < startTime
        }
        if (activeFilter === "Completed") {
            return session.status === 'completed'
        }
        if (activeFilter === "Cancelled") {
            return session.status === 'cancelled'
        }
        return true
    })

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Derived metrics (using all sessions for high-level summary, or filtered? Let's use filtered for the table/chart)
    const todayStr = new Date().toISOString().slice(0, 10)
    const todaysSessionsCount = sessions.filter(s => s.start_time.startsWith(todayStr)).length

    // Process data for graph (sessions per day) - using filtered data
    const sessionsPerDay = filteredSessions.reduce((acc: any, session) => {
        const day = formatDate(session.start_time)
        acc[day] = (acc[day] || 0) + 1
        return acc
    }, {})

    const graphData = Object.entries(sessionsPerDay).map(([day, count]) => ({
        day,
        count,
    }))

    return (
        <div className="space-y-8">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-medium tracking-tight text-gray-900">Sessions</h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">CALENDAR & SCHEDULE</p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <Tooltip content={`Filter: ${activeFilter} `} side="bottom">
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-2xl border-gray-100 shadow-sm bg-white hover:bg-gray-50 text-gray-600 transition-all duration-300 w-11 h-11"
                                >
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                        </Tooltip>
                        <DropdownMenuContent className="rounded-2xl border-gray-100 shadow-xl p-1.5">
                            <DropdownMenuItem className="rounded-xl px-4 py-2 text-xs font-medium" onClick={() => setActiveFilter("All")}>All Sessions</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-2 text-xs font-medium" onClick={() => setActiveFilter("Active")}>Active</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-2 text-xs font-medium" onClick={() => setActiveFilter("Upcoming")}>Upcoming</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-2 text-xs font-medium" onClick={() => setActiveFilter("Completed")}>Completed</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-2 text-xs font-medium" onClick={() => setActiveFilter("Cancelled")}>Cancelled</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip content={isCreating ? "Cancel" : "Add Session"} side="left">
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
                        <h3 className="text-sm font-semibold text-gray-900">Schedule Session</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCreating(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </Button>
                    </div>
                    <CreateSessionFormI
                        defaultValues={{
                            course_id: "",
                            student_id: "",
                            start_time: "",
                            end_time: "",
                            topic: "",
                        }}
                    />
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today's Sessions</CardTitle>
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
                            <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900">{todaysSessionsCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Upcoming Schedule Load</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 pt-4">
                    <div className="h-[220px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
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
                                        cursor={{ fill: 'rgba(241, 245, 249, 0.4)', radius: 4 }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            padding: '8px 12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6"
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
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Session List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-50 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Date & Time</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Course</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Student</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Topic</TableHead>
                                    <TableHead className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Status</TableHead>
                                    <TableHead className="text-right text-[10px] uppercase font-semibold tracking-wider text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-gray-400 text-sm">
                                            No {activeFilter === "All" ? "" : activeFilter.toLowerCase()} sessions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedSessions.map((session) => (
                                        <TableRow key={session.id} className="group transition-colors hover:bg-gray-50/50 border-gray-50">
                                            <TableCell className="py-4">
                                                <div className="font-medium text-gray-900">{formatDate(session.start_time)}</div>
                                                <div className="text-[10px] font-medium text-gray-400 mt-0.5">{formatTime(session.start_time)} — {formatTime(session.end_time)}</div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 font-medium">{session.course?.title || "—"}</TableCell>
                                            <TableCell className="text-gray-600">{session.student?.full_name || "—"}</TableCell>
                                            <TableCell className="text-gray-500 max-w-[150px] truncate">{session.topic || "—"}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                                    session.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        session.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            'bg-gray-50 text-gray-500 border-gray-100'
                                                )}>
                                                    {session.status.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Tooltip content="Session Details" side="top">
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
                                                                onSelect={() => handleDeleteClick(session.id)}
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

                        {filteredSessions.length > itemsPerPage && (
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
                title="Delete Session"
                description="Are you sure you want to delete this session? This action cannot be undone."
            />
        </div>
    )
}
