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
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />

        {/* Full viewport layout */}
        <main className="flex flex-1 overflow-hidden bg-gray-50/50">

          {/* Main Dashboard Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">


            {/* Tabs (state only, no content) */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-[300px] grid-cols-3 rounded-xl">
                <TabsTrigger value="courses" className="rounded-xl hover:text-black">Courses</TabsTrigger>
                <TabsTrigger value="students" className="rounded-xl hover:text-black">Students</TabsTrigger>
                <TabsTrigger value="sessions" className="rounded-xl hover:text-black">Sessions</TabsTrigger>
              </TabsList>
            </Tabs>

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
    </TamboProvider>
  );
}

