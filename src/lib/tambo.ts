/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Tutor Dashboard Actions
import { 
  getStudents, 
  getCourses, 
  getSessions, 
  getMonthlyEarnings, 
  getStudentRisks,
  createStudent,
  createCourse,
  createSession
} from "@/app/actions/tutor";

// Tutor Dashboard Components
import { EarningsChart, earningsChartSchema } from "@/components/tutor-dashboard/EarningsChart";
import { StudentTable, studentTableSchema } from "@/components/tutor-dashboard/StudentTable";
import { SessionTimeline, sessionTimelineSchema } from "@/components/tutor-dashboard/SessionTimeline";
import { StudentSummaryCard, studentSummaryCardSchema } from "@/components/tutor-dashboard/StudentSummaryCard";
import { CourseOverviewTable, courseOverviewTableSchema } from "@/components/tutor-dashboard/CourseOverviewTable";
import { RiskStudentList, riskStudentListSchema } from "@/components/tutor-dashboard/RiskStudentList";
import { PerformanceChart, performanceChartSchema } from "@/components/tutor-dashboard/PerformanceChart";

/**
 * tools
 */
export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description: "A tool to get population statistics by country",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description: "A tool to get global population trends",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  // Tutor Tools
  {
    name: "getStudents",
    description: "Fetch list of students for the tutor",
    tool: getStudents,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      full_name: z.string(),
      email: z.string().nullable(),
      grade_level: z.string().nullable(),
      status: z.enum(['active', 'inactive', 'archived']),
      risk_score: z.number(),
    })).describe('List of students'),
  },
  {
    name: "getCourses",
    description: "Fetch list of courses created by the tutor",
    tool: getCourses,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      hourly_rate: z.number().nullable(),
      student_count: z.number().optional(),
    })).describe('List of courses'),
  },
  {
    name: "getSessions",
    description: "Fetch upcoming and recent sessions",
    tool: getSessions,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      status: z.enum(['scheduled', 'completed', 'cancelled']),
      topic: z.string().nullable(),
      student: z.object({ full_name: z.string() }).nullable(),
      course: z.object({ title: z.string() }).nullable(),
    })).describe('List of sessions'),
  },
  {
    name: "getMonthlyEarnings",
    description: "Fetch monthly earnings based on payments",
    tool: getMonthlyEarnings,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      month: z.string(),
      total: z.number(),
    })).describe('Monthly earnings data'),
  },
  {
    name: "getStudentRisks",
    description: "Fetch students who are at risk (low scores/engagement)",
    tool: getStudentRisks,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      full_name: z.string(),
      risk_score: z.number(),
      notes: z.string().nullable(),
    })).describe('List of at-risk students'),
  },
  // Mutations
  {
    name: "createStudent",
    description: "Create a new student record",
    tool: createStudent,
    inputSchema: z.object({
      full_name: z.string(),
      email: z.string().optional(),
      grade_level: z.string().optional(),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      full_name: z.string(),
      status: z.string(),
    }).describe('Created student details'),
  },
  {
    name: "createCourse",
    description: "Create a new course",
    tool: createCourse,
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      hourly_rate: z.number().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      title: z.string(),
    }).describe('Created course details'),
  },
  {
    name: "createSession",
    description: "Schedule a new session",
    tool: createSession,
    inputSchema: z.object({
      course_id: z.string().describe('UUID of the course'),
      student_id: z.string().describe('UUID of the student'),
      start_time: z.string().describe('ISO timestamp for start time'),
      end_time: z.string().describe('ISO timestamp for end time'),
      topic: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      start_time: z.string(),
      status: z.string(),
    }).describe('Created session details'),
  },
];

/**
 * components
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "A component that renders various types of charts using Recharts.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description: "A component that displays options as clickable cards.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Tutor Components
  {
    name: "StudentTable",
    description: "Table displaying a list of students with details like status and risk score.",
    component: StudentTable,
    propsSchema: studentTableSchema,
  },
  {
    name: "EarningsChart",
    description: "Bar chart displaying monthly earnings.",
    component: EarningsChart,
    propsSchema: earningsChartSchema,
  },
  {
    name: "SessionTimeline",
    description: "Timeline view of upcoming and past sessions.",
    component: SessionTimeline,
    propsSchema: sessionTimelineSchema,
  },
  {
    name: "StudentSummaryCard",
    description: "Card displaying high-level summary of a specific student.",
    component: StudentSummaryCard,
    propsSchema: studentSummaryCardSchema,
  },
  {
    name: "CourseOverviewTable",
    description: "Table listing courses and their details.",
    component: CourseOverviewTable,
    propsSchema: courseOverviewTableSchema,
  },
  {
    name: "RiskStudentList",
    description: "List of students flagged as at-risk.",
    component: RiskStudentList,
    propsSchema: riskStudentListSchema,
  },
    {
    name: "PerformanceChart",
    description: "Line chart showing student performance over time.",
    component: PerformanceChart,
    propsSchema: performanceChartSchema,
  },
];
