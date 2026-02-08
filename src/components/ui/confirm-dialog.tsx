"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "default"
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "destructive",
    isLoading = false,
}: ConfirmDialogProps) {
    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) {
            window.addEventListener("keydown", handleEscape)
        }
        return () => window.removeEventListener("keydown", handleEscape)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={cn(
                                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
                                variant === "destructive" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                            )}>
                                <AlertCircle className="h-6 w-6" />
                            </div>

                            <h2 className="mb-2 text-lg font-semibold text-gray-900">{title}</h2>
                            <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                                {description}
                            </p>

                            <div className="flex w-full gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 rounded-2xl border-gray-100 font-medium text-gray-600 hover:bg-gray-50 h-11"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    variant={variant === "destructive" ? "default" : "default"}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onConfirm()
                                    }}
                                    disabled={isLoading}
                                    className={cn(
                                        "flex-1 rounded-2xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] h-11",
                                        variant === "destructive"
                                            ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                            : "bg-black hover:bg-gray-900 shadow-gray-200"
                                    )}
                                >
                                    {isLoading ? "Processing..." : confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
