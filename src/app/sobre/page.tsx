import Link from 'next/link'

const equipe = [
  { nome: 'Isabela Garcia', iniciais: 'IG' },
  { nome: 'Laura Borin', iniciais: 'LB' },
  { nome: 'Letícia Dias', iniciais: 'LD' },
]

const techs = ['Next.js', 'Supabase', 'Vercel', 'TypeScript', 'Tailwind CSS']

const diferenciais = [
  { titulo: 'Leilão Reverso', desc: 'Mecanismo de preço onde distribuidoras competem pelo menor valor, invertendo o poder de barganha a favor dos postos.' },
  { titulo: 'Transparência de Preços', desc: 'Cotações em tempo real eliminam a assimetria de informação que eleva preços em até 20% nas negociações manuais.' },
  { titulo: 'Compliance Digital', desc: 'NF-e automática com cálculo de ICMS, PIS e COFINS. Contratos digitais com hash SHA-256 e rastreabilidade completa.' },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8621A] flex items-center justify-center text-white font-black text-lg">F</div>
            <span className="text-xl font-bold text-gray-900">Fuel<span className="text-[#E8621A]">Bid</span></span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Voltar</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 text-center max-w-4xl mx-auto">
        <span className="inline-flex bg-[#FFF1E8] text-[#E8621A] rounded-full px-4 py-1.5 text-sm font-medium">Trabalho de Conclusão de Curso — FGV-EAESP 2025</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6">Digitalizando a Revenda de Combustíveis</h1>
        <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          Plataforma de marketplace B2B que utiliza leilão reverso para conectar postos de bandeira branca a distribuidoras, reduzindo custos e aumentando a transparência do mercado.
        </p>
      </section>

      {/* Problema */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">O Problema</h2>
            <div className="text-gray-600 leading-relaxed space-y-4 text-sm">
              <p>O mercado brasileiro de combustíveis movimenta mais de <strong>R$ 770 bilhões por ano</strong>, com mais de 43 mil postos revendedores — 40% deles operando como bandeira branca.</p>
              <p>Esses postos independentes enfrentam uma <strong>assimetria de informação</strong> crônica: negociações feitas por telefone, sem transparência de preços, com poder de barganha limitado frente às grandes distribuidoras.</p>
              <p>O resultado são margens comprimidas, processos lentos e dependência de relacionamentos pessoais. Cartéis regionais podem elevar preços em <strong>10% a 20%</strong> acima do praticado em mercados mais competitivos.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { valor: 'R$ 770 bi', label: 'Mercado anual de combustíveis' },
              { valor: '43.000+', label: 'Postos revendedores no Brasil' },
              { valor: '40%', label: 'Operam como bandeira branca' },
            ].map(s => (
              <div key={s.label} className="bg-[#F8F7F4] rounded-2xl p-6 border border-gray-100">
                <p className="text-3xl font-extrabold text-[#E8621A]">{s.valor}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center">A Solução</h2>
          <p className="text-gray-500 text-center mt-2 mb-12 max-w-xl mx-auto">Marketplace B2B com leilão reverso que inverte o poder de negociação</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {diferenciais.map(d => (
              <div key={d.titulo} className="bg-white rounded-2xl border border-gray-100 p-8 transition-all duration-200 hover:shadow-md">
                <h3 className="font-bold text-gray-900 mb-2">{d.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Equipe</h2>
          <div className="grid grid-cols-3 gap-8 mt-12">
            {equipe.map(p => (
              <div key={p.nome} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#FFF1E8] flex items-center justify-center text-2xl font-bold text-[#E8621A]">{p.iniciais}</div>
                <h3 className="text-lg font-semibold mt-4">{p.nome}</h3>
                <p className="text-sm text-[#E8621A]">Co-fundadora</p>
                <p className="text-xs text-gray-400 mt-1">FGV-EAESP</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologia */}
      <section className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-6">Construído com</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {techs.map(t => (
              <span key={t} className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium text-gray-600">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white py-8 text-center">
        <p className="text-xs text-gray-300">© 2025 FuelBid — FGV-EAESP</p>
      </footer>
    </div>
  )
}
