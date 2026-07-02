import AdminThemeToggle from '@/components/AdminThemeToggle'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="fixed top-4 right-4 z-50">
        <AdminThemeToggle />
      </div>
      {children}
    </div>
  )
}
