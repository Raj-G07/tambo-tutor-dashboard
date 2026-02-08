"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar, Filter } from "lucide-react" // Ensure lucide-react is available or use text
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
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
import { getSessions } from "@/app/actions/tutor"
import { CreateSessionFormI } from "@/lib/tambo"

// Helper to format date for display
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
    })
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric', minute: '2-digit'
    })
}

export function SessionsView({ isActive }: { isActive: boolean }) {
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
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
        <div className="space-y-6 pt-4">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
                    <p className="text-sm text-muted-foreground">Manage and track your tutoring sessions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl ">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setActiveFilter("All")}>All Sessions</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter("Active")}>Active</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter("Upcoming")}>Upcoming</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter("Completed")}>Completed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter("Cancelled")}>Cancelled</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        {isCreating ? "Cancel" : "Session"}
                    </Button>
                </div>
            </div>
            {isCreating && isActive && (
                <div className="rounded-lg border p-4 shadow-sm bg-white">
                    <CreateSessionFormI defaultValues={{
                        course_id: "",
                        student_id: "",
                        start_time: "",
                        end_time: "",
                        topic: "",
                    }}/>
                </div>
            )}

            {/* 2. Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todaysSessionsCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Analytics Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Schedule Load</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] w-full min-w-0">
                        {isActive && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
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
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6" // Blue
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
                        <CardTitle>Session List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No {activeFilter === "All" ? "" : activeFilter.toLowerCase()} sessions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="font-medium">{formatDate(session.start_time)}</div>
                                                <div className="text-xs text-muted-foreground">{formatTime(session.start_time)} - {formatTime(session.end_time)}</div>
                                            </TableCell>
                                            <TableCell>{session.course?.title || "N/A"}</TableCell>
                                            <TableCell>{session.student?.full_name || "N/A"}</TableCell>
                                            <TableCell>{session.topic || "-"}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${session.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    session.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {session.status}
                                                </span>
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
        </div>
    )
}
