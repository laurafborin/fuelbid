import Link from 'next/link'

const equipe = [
  { nome: 'Isabela Garcia', iniciais: 'IG' },
  { nome: 'Laura Borin', iniciais: 'LB' },
  { nome: 'Letícia Dias', iniciais: 'LD' },
]

const techs = [
  { nome: 'Next.js 16', desc: 'Framework React fullstack' },
  { nome: 'Supabase', desc: 'Backend-as-a-Service (PostgreSQL + Auth + Realtime)' },
  { nome: 'TypeScript', desc: 'Tipagem estática' },
  { nome: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
  { nome: 'Vercel', desc: 'Deploy e hosting' },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-black text-lg">F</div>
          <span className="text-xl font-bold text-gray-900">FuelBid</span>
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Voltar</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        <section className="text-center">
          <span className="bg-[#FFF1E8] text-brand rounded-full px-4 py-1.5 text-sm font-medium">Trabalho de Conclusão de Curso</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Sobre o FuelBid</h1>
          <p className="text-gray-500 mt-3 leading-relaxed">
            Plano de Negócios desenvolvido para o TCC do curso de Administração de Empresas da FGV-EAESP.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">O Problema</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-700 leading-relaxed space-y-3">
            <p>O mercado brasileiro de combustíveis movimenta mais de R$ 770 bilhões por ano, com 43 mil postos — 40% deles de bandeira branca.</p>
            <p>Esses postos independentes enfrentam <strong>assimetria de informação</strong> na negociação com distribuidoras: processos manuais por telefone, falta de transparência nos preços e poder de barganha limitado.</p>
            <p>O resultado é ineficiência operacional, margens reduzidas e dependência de relacionamentos pessoais para conseguir boas condições comerciais.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">A Solução</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-700 leading-relaxed space-y-3">
            <p>A plataforma FuelBid propõe a <strong>digitalização da intermediação</strong> entre distribuidoras de combustíveis e postos de bandeira branca, utilizando <strong>leilão reverso</strong> como mecanismo central de negociação.</p>
            <p>O posto publica sua demanda (tipo de combustível, volume, prazo) e distribuidoras competem pelo menor preço. A plataforma gera contratos digitais com hash SHA-256, processa pagamentos via PIX e emite NF-e automaticamente com cálculo de ICMS, PIS e COFINS.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipe.map((p) => (
              <div key={p.nome} className="bg-white rounded-2xl border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md">
                <div className="w-16 h-16 bg-[#FFF1E8] rounded-full flex items-center justify-center text-xl font-bold text-brand mx-auto">
                  {p.iniciais}
                </div>
                <h3 className="font-bold text-gray-900 mt-3">{p.nome}</h3>
                <p className="text-sm text-gray-500">Co-fundadora</p>
                <p className="text-xs text-gray-400">FGV-EAESP</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tecnologia</h2>
          <div className="space-y-2">
            {techs.map((t) => (
              <div key={t.nome} className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-sm">
                <span className="font-medium text-sm text-gray-900">{t.nome}</span>
                <span className="text-xs text-gray-500">{t.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
          FuelBid © 2025 — FGV-EAESP
        </footer>
      </div>
    </div>
  )
}
