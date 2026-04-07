import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <svg className="w-24 h-24 text-gray-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
      <p className="mt-2 text-gray-500 max-w-sm">A página que você procura não existe ou foi movida.</p>
      <Link href="/" className="mt-6 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors">
        Voltar ao início
      </Link>
    </div>
  )
}
