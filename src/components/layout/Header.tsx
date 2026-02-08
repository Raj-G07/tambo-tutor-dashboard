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
    subtitle = "AI Tutor Dashboard",
    ...props
}: HeaderProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-[100] w-full border-b border-border/40 bg-background/60 backdrop-blur-xl",
                "px-6 py-3 flex items-center justify-between transition-all duration-300",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold tracking-tight text-foreground/90 leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group p-1 rounded-full hover:bg-muted/50 transition-colors">
                    <div className="absolute inset-0 bg-[#7FFFC3]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image
                        src="/Octo-Icon.svg"
                        alt="Tambo Icon"
                        width={28}
                        height={28}
                        className="relative rounded-md hover:scale-110 transition-transform duration-300 ease-out grayscale hover:grayscale-0 opacity-80 hover:opacity-100"
                    />
                </div>
            </div>
        </header>
    );
}
