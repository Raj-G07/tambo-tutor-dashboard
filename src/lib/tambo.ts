/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 */

import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool, withInteractable } from "@tambo-ai/react";
import { z } from "zod";

// Tutor Dashboard Actions
import {
  getStudents,
  getCourses,
  getSessions,
  updateStudent,
  updateSession,
  updateCourse,
  deleteCourse,
  deleteSession,
  deleteStudent
} from "@/app/actions/tutor";

// Tutor Dashboard Components
import { StudentTable, studentTableSchema } from "@/components/tutor-dashboard/StudentTable";
import { SessionTimeline, sessionTimelineSchema } from "@/components/tutor-dashboard/SessionTimeline";
import { StudentSummaryCard, studentSummaryCardSchema } from "@/components/tutor-dashboard/StudentSummaryCard";
import { CourseOverviewTable, courseOverviewTableSchema } from "@/components/tutor-dashboard/CourseOverviewTable";


// CRUD Components
import { CreateStudentForm, createStudentFormSchema } from "@/components/tutor-dashboard/CreateStudentForm";


import { CreateCourseForm, createCourseFormSchema } from "@/components/tutor-dashboard/CreateCourseForm";


import { CreateSessionForm, createSessionFormSchema } from "@/components/tutor-dashboard/CreateSessionForm";

/**
 * tools
 */
export const tools: TamboTool[] = [
  // Tutor Tools
  {
    name: "getStudents",
    description: "Fetch list of students for the tutor",
    tool: getStudents,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string().describe("UUID of the student"),
      full_name: z.string().describe("Full name of the student"),
      email: z.string().nullable().describe("Email of the student"),
      grade_level: z.string().nullable().describe("Grade level of the student"),
      status: z.enum(['active', 'inactive', 'archived']).describe("Status of the student"),
    })).describe('List of students'),
    transformToContent: (students: any) =>
      students.map((s: any) => ({
        key: s.id,
        type: "text",
        text: `👤 ${s.full_name} (${s.status}) — Notes: ${s.notes}`,
      })),

  },
  {
    name: "getCourses",
    description: "Fetch list of courses created by the tutor",
    tool: getCourses,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string().describe("UUID of the course"),
      title: z.string().describe("Title of the course"),
      description: z.string().describe("Description of the course"),
      hourly_rate: z.number().describe("Hourly rate of the course"),
      student_count: z.number().optional().describe("Number of students enrolled in the course"),
    })).describe('List of courses'),
    transformToContent: (courses: any) =>
      courses.map((course: any) => ({
        key: course.id,
        type: "text",
        text: `📘 ${course.title} — $${course.hourly_rate} - ${course.description}`,
      })),
  },
  {
    name: "getSessions",
    description: "Fetch upcoming and recent sessions",
    tool: getSessions,
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string().describe("UUID of the session"),
      start_time: z.string().describe("Start time of the session"),
      end_time: z.string().describe("End time of the session"),
      status: z.enum(['scheduled', 'completed', 'cancelled']).describe("Status of the session"),
      topic: z.string().nullable().describe("Topic of the session"),
      student: z.object({ full_name: z.string() }).nullable().describe("Student of the session"),
      course: z.object({ title: z.string() }).nullable().describe(""),
    })).describe('List of sessions'),
    transformToContent: (sessions: any) =>
      sessions.map((s: any) => ({
        key: s.id,
        type: "text",
        text: `🕒 ${s.course?.title ?? "Session"} with ${s.student?.full_name ?? "Unknown"
          } — ${s.status} with start_time: ${s.start_time} and end_time: ${s.end_time}`,
      })),
  },
  {
    name: "updateStudent",
    description: "Update a existing student's details",
    tool: updateStudent,
    inputSchema: z.object({
      id: z.string(),
      patch: z.object({
        full_name: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
        grade_level: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z.enum(["active", "inactive", "archived"]).nullable().optional(),
      }),
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the student"),
      full_name: z.string().describe("Full name of the student"),
      email: z.string().describe("Email of the student"),
      grade_level: z.string().describe("Grade level of the student"),
      status: z.enum(['active', 'inactive', 'archived']).describe("Status of the student"),
    }).describe('Updated student'),
    transformToContent: (student: any) => [{
      type: "text",
      text: `👤 ${student.full_name} (${student.status}) — Notes: ${student.notes}`,
    }]
  },
  {
    name: "updateCourse",
    description: "Update a existing course's details",
    tool: updateCourse,
    inputSchema: z.object({
      id: z.string().describe("UUID of the course"),
      patch: z.object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        hourly_rate: z.number().nullable().optional()
      }),
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the course"),
      title: z.string().describe("Title of the course"),
      description: z.string().describe("Description of the course"),
      hourly_rate: z.number().describe("Hourly rate of the course"),
      student_count: z.number().optional().describe("Number of students enrolled in the course"),
    }).describe('Updated course'),
  },
  {
    name: "updateSession",
    description: "Update a existing session's details",
    tool: updateSession,
    inputSchema: z.object({
      id: z.string(),
      patch: z.object({
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        topic: z.string().nullable().optional(),
        status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
      })
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the session"),
      start_time: z.string().describe("Start time of the session"),
      end_time: z.string().describe("End time of the session"),
      status: z.enum(['scheduled', 'completed', 'cancelled']).describe("Status of the session"),
      topic: z.string().nullable().describe("Topic of the session"),
      student: z.object({ full_name: z.string() }).nullable().describe("Student of the session"),
      course: z.object({ title: z.string() }).nullable().describe(""),
    }).describe('Updated session'),
  },
  {
    name: "deleteStudentConfirm",
    description: "Delete a student",
    tool: deleteStudent,
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the student"),
    }).describe('Deleted student'),
    transformToContent: (student: any) => [{
      type: "text",
      text: `👤 ${student.full_name} (${student.status}) — Notes: ${student.notes}`,
    }]
  },
  {
    name: "deleteCourseConfirm",
    description: "Delete a course",
    tool: deleteCourse,
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the course"),
    }).describe('Deleted course'),
    transformToContent: (course: any) => [{
      type: "text",
      text: `📘 ${course.title} — $${course.hourly_rate} - ${course.description}`,
    }]
  },
  {
    name: "deleteSessionConfirm",
    description: "Delete a session",
    tool: deleteSession,
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      id: z.string().describe("UUID of the session"),
    }).describe('Deleted session'),
    transformToContent: (session: any) => [{
      type: "text",
      text: `🕒 ${session.course?.title ?? "Session"} with ${session.student?.full_name ?? "Unknown"
        } — ${session.status}`,
    }]
  },

];

/**
 * components
 */
export const components: TamboComponent[] = [
  // Tutor Components
  {
    name: "StudentTable",
    description: "Table displaying a list of students with details like status.",
    component: StudentTable,
    propsSchema: studentTableSchema,
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
  }
];
// Students
export const CreateStudentFormI = withInteractable(CreateStudentForm, {
  componentName: "CreateStudentForm",
  description: "Form to add a new student. Use when user says 'add student', 'enroll student'.",
  propsSchema: createStudentFormSchema,
})

// Courses
export const CreateCourseFormI = withInteractable(CreateCourseForm, {
  componentName: "CreateCourseForm",
  description: "Form to create a new course. Use when user says 'create course', 'add course'.",
  propsSchema: createCourseFormSchema,
})



// Sessions
export const CreateSessionFormI = withInteractable(CreateSessionForm, {
  componentName: "CreateSessionForm",
  description: "Form to schedule a session. Use when user says 'schedule session', 'add class'.",
  propsSchema: createSessionFormSchema,
})
