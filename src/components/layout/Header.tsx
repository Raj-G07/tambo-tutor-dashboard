"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";


interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    subtitle?: string;
}

export function Header({
    className,
    title = "Tutor",
    subtitle = "AI Dashboard",
    ...props
}: HeaderProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-[100] w-full border-b border-gray-100 bg-white/70 backdrop-blur-xl",
                "px-8 py-4 flex items-center justify-between transition-all duration-300",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-6">
                <div className="relative group flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:border-green-100 group-hover:bg-white group-hover:scale-105 active:scale-95 relative overflow-hidden">
                        <Image
                            src="/Octo-Icon.svg"
                            alt="Tambo Icon"
                            width={22}
                            height={22}
                            className="relative opacity-90 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[15px] font-medium tracking-tight text-gray-900 leading-none">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400/80 mt-1.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>


        </header>
    );
}
