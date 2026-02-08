"use client";

import * as React from "react";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import {
  currentTimeContextHelper,
  currentPageContextHelper,
} from "@tambo-ai/react";

import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesView } from "@/components/tutor-dashboard/CoursesView";
import { StudentsView } from "@/components/tutor-dashboard/StudentsView";
import { SessionsView } from "@/components/tutor-dashboard/SessionsView";

import { Header } from "@/components/layout/Header";

import { BookOpen, Users, CalendarDays } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/tambo/suggestions-tooltip";

export default function Home() {
  const mcpServers = useMcpServers();
  const [activeTab, setActiveTab] = React.useState("courses");

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={{
        userTime: currentTimeContextHelper,
        userPage: currentPageContextHelper,
      }}
    >
      <TooltipProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-white">
          <Header />

          {/* Full viewport layout */}
          <main className="flex flex-1 overflow-hidden">

            {/* Main Dashboard Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">

              {/* Icon Navigation */}
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-white border border-gray-100 p-1.5 h-12 rounded-2xl shadow-sm gap-1">
                    <Tooltip content="Courses" side="bottom">
                      <TabsTrigger
                        value="courses"
                        className="rounded-xl px-4 py-2 text-gray-400 data-[state=active]:text-green-600 data-[state=active]:bg-green-50/50 transition-all duration-300"
                      >
                        <BookOpen className="w-[18px] h-[18px]" strokeWidth={2.2} />
                      </TabsTrigger>
                    </Tooltip>
                    <Tooltip content="Students" side="bottom">
                      <TabsTrigger
                        value="students"
                        className="rounded-xl px-4 py-2 text-gray-400 data-[state=active]:text-green-600 data-[state=active]:bg-green-50/50 transition-all duration-300"
                      >
                        <Users className="w-[18px] h-[18px]" strokeWidth={2.2} />
                      </TabsTrigger>
                    </Tooltip>
                    <Tooltip content="Sessions" side="bottom">
                      <TabsTrigger
                        value="sessions"
                        className="rounded-xl px-4 py-2 text-gray-400 data-[state=active]:text-green-600 data-[state=active]:bg-green-50/50 transition-all duration-300"
                      >
                        <CalendarDays className="w-[18px] h-[18px]" strokeWidth={2.2} />
                      </TabsTrigger>
                    </Tooltip>
                  </TabsList>
                </Tabs>
              </div>

              {/* Views (CSS hide/show, NOT mount/unmount) */}
              <div className={activeTab === "courses" ? "block" : "hidden"}>
                <CoursesView isActive={activeTab === "courses"} />
              </div>

              <div className={activeTab === "students" ? "block" : "hidden"}>
                <StudentsView isActive={activeTab === "students"} />
              </div>

              <div className={activeTab === "sessions" ? "block" : "hidden"}>
                <SessionsView isActive={activeTab === "sessions"} />
              </div>

            </div>

            {/* Right Sidebar - Chat */}
            <div className="w-[400px] border-l bg-white flex flex-col">
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <MessageThreadFull />
              </div>
            </div>

          </main>
        </div>
      </TooltipProvider>
    </TamboProvider>
  );
}

