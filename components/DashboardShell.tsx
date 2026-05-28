'use client'

import { createContext, useContext, useState } from 'react'
import { Sidebar } from './Sidebar'

// ─── Context shared between DashboardShell → Header → Sidebar ─────────────

type SidebarCtx = { open: boolean; toggle: () => void; close: () => void }

const SidebarContext = createContext<SidebarCtx>({
  open: false,
  toggle: () => {},
  close: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

// ─── Shell ────────────────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const ctx: SidebarCtx = {
    open,
    toggle: () => setOpen((v) => !v),
    close:  () => setOpen(false),
  }

  return (
    <SidebarContext.Provider value={ctx}>
      <div className="flex min-h-screen">

        {/* Mobile backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on lg+ */}
        <Sidebar isOpen={open} onClose={() => setOpen(false)} />

        {/* Main content — no left margin on mobile, 256px on lg+ */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
