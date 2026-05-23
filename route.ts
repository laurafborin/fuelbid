'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <svg className="w-24 h-24 text-red-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h1 className="text-2xl font-bold text-gray-900">Algo deu errado</h1>
      <p className="mt-2 text-gray-500 max-w-sm">Ocorreu um erro inesperado. Tente novamente.</p>
      <button onClick={reset} className="mt-6 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors">
        Tentar novamente
      </button>
    </div>
  )
}
