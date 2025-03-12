"use client"

import { useEffect, useState } from "react"

export function Toaster() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      <div className="group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all">
        <div className="flex-1 group-hover:pr-10">
          <div className="font-medium">Toast Notification</div>
          <div className="text-sm opacity-90">This is a simplified toast component.</div>
        </div>
      </div>
    </div>
  )
}

