export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you’re looking for doesn’t exist.</p>
      <a href="/portfolio" className="text-blue-500 underline">Back to portfolio</a>
    </main>
  )
}