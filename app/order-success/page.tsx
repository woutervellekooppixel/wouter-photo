export const metadata = {
  title: "Bestelling Voltooid – Wouter.Photo",
  description: "Bedankt voor je aankoop!",
}

export default function OrderSuccessPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 text-center bg-white dark:bg-black min-h-screen">
      <div className="text-black dark:text-white">
        <h1 className="text-4xl font-bold mb-6">Bedankt voor je aankoop! 🎉</h1>
        <p className="text-xl mb-8">
          Je bestelling is succesvol afgerond. Je ontvangt binnenkort een e-mail met de downloadlinks.
        </p>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Heb je vragen over je bestelling? Neem gerust contact op via{' '}
            <a 
              href="mailto:hello@wouter.photo" 
              className="underline hover:text-gray-800 dark:hover:text-gray-100"
            >
              hello@wouter.photo
            </a>
          </p>
          <div className="pt-8">
            <a 
              href="/portfolio" 
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition"
            >
              Terug naar Portfolio
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
