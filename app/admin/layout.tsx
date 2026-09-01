export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {children}
    </div>
  )
}
