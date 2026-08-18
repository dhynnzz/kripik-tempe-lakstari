import * as React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import "./notif.css"

/* ==========================================================
   1. SHADCN NOTIF COMPONENT VARIANT & DEFINITIONS
   ========================================================== */

const notifVariants = cva("notif-root relative border", {
  variants: {
    variant: {
      default: "border-border bg-background",
      warning: "border-amber-500/50 text-amber-600",
      error: "border-red-500/50 text-red-600",
      success: "border-emerald-500/50 text-emerald-600",
      info: "border-blue-500/50 text-blue-600",
    },
    size: {
      sm: "notif-size-sm",
      lg: "notif-size-lg",
    },
    isNotification: {
      true: "notif-pill-mode",
      false: "rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
    isNotification: false,
  },
})

export interface NotifProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notifVariants> {
  icon?: React.ReactNode
  action?: React.ReactNode
  layout?: "row" | "complex"
}

const Notif = React.forwardRef<HTMLDivElement, NotifProps>(
  (
    {
      className,
      variant,
      size,
      isNotification,
      icon,
      action,
      layout = "row",
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        notifVariants({ variant, size, isNotification }),
        className,
      )}
      {...props}
    >
      {layout === "row" ? (
        <div className="notif-row-layout">
          {icon && <span className="notif-icon-slot">{icon}</span>}
          <div className="notif-content-slot">{children}</div>
          {action && <div className="notif-action-slot">{action}</div>}
        </div>
      ) : (
        <div className="notif-complex-layout">
          {icon && <span className="notif-icon-slot">{icon}</span>}
          <div className="notif-content-slot">{children}</div>
          {action && <div className="notif-action-slot">{action}</div>}
        </div>
      )}
    </div>
  ),
)
Notif.displayName = "Notif"

const NotifTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("text-xs font-medium", className)} {...props} />
))
NotifTitle.displayName = "NotifTitle"

const NotifDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
NotifDescription.displayName = "NotifDescription"

const NotifContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
))
NotifContent.displayName = "NotifContent"

/* ==========================================================
   2. CONTEXT & STATE MANAGER
   ========================================================== */

export type NotifType = 'success' | 'warning' | 'error' | 'info'

export interface NotifItem {
  id: string
  type: NotifType
  message: string
  duration?: number
}

interface NotifContextType {
  notifs: NotifItem[]
  showNotif: (notif: Omit<NotifItem, 'id'>) => void
  removeNotif: (id: string) => void
}

const NotifContext = createContext<NotifContextType | undefined>(undefined)

export const useNotif = () => {
  const context = useContext(NotifContext)
  if (!context) {
    throw new Error('useNotif harus digunakan di dalam NotifProvider')
  }
  return context
}

export const NotifProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifs, setNotifs] = useState<NotifItem[]>([])

  const removeNotif = useCallback((id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const showNotif = useCallback(
    (notif: Omit<NotifItem, 'id'>) => {
      const id = `${Date.now()}`
      const duration = notif.duration ?? 2500

      setNotifs([{ ...notif, id, duration }])

      if (duration > 0) {
        setTimeout(() => {
          removeNotif(id)
        }, duration)
      }
    },
    [removeNotif]
  )

  return (
    <NotifContext.Provider value={{ notifs, showNotif, removeNotif }}>
      {children}
    </NotifContext.Provider>
  )
}

/* ==========================================================
   3. COMPACT FLOATING NOTIF CONTAINER (1-LINE CAPSULE)
   ========================================================== */

export const NotifContainer: React.FC = () => {
  const { notifs, removeNotif } = useNotif()

  if (notifs.length === 0) return null

  const current = notifs[notifs.length - 1]

  const renderIcon = () => {
    switch (current.type) {
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={15} strokeWidth={2.5} />
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={15} strokeWidth={2.5} />
      case 'error':
        return <XCircle className="text-red-500" size={15} strokeWidth={2.5} />
      case 'info':
      default:
        return <Info className="text-blue-500" size={15} strokeWidth={2.5} />
    }
  }

  return (
    <div className="compact-notif-portal">
      <Notif
        layout="row"
        variant={current.type}
        size="sm"
        isNotification={true}
        icon={renderIcon()}
        action={
          <button
            onClick={() => removeNotif(current.id)}
            className="notif-close-btn"
            aria-label="Tutup"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        }
        className="shadcn-notif-bar"
      >
        <span className="notif-text-msg">
          {current.message}
        </span>
      </Notif>
    </div>
  )
}

export { Notif, NotifTitle, NotifDescription, NotifContent }
