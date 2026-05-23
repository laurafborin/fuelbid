import Link from 'next/link'

const equipe = [
  { nome: 'Isabela Garcia', iniciais: 'IG', curso: 'Administração de Empresas' },
  { nome: 'Laura Borin', iniciais: 'LB', curso: 'Administração de Empresas' },
  { nome: 'Letícia Dias', iniciais: 'LD', curso: 'Administração de Empresas' },
]

const techs = ['Next.js 16', 'Supabase', 'Vercel', 'TypeScript', 'Tailwind CSS']

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8621A] flex items-center justify-center text-white font-black text-lg">T</div>
            <span className="text-xl font-bold text-gray-900">Tan<span className="text-[#E8621A]">qe</span></span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Voltar</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 text-center max-w-3xl mx-auto px-6">
        <span className="inline-flex bg-[#FFF1E8] text-[#E8621A] rounded-full px-4 py-1.5 text-sm font-medium">Trabalho de Conclusão de Curso 2025</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6">Digitalizando a Revenda de Combustíveis</h1>
        <p className="text-lg text-gray-500 mt-4">Proposta de plataforma de intermediação entre distribuidoras e postos de bandeira branca.</p>
      </section>

      {/* O Problema */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">O Problema</h2>
            <div className="text-gray-600 leading-relaxed space-y-4 text-[15px]">
              <p>O mercado brasileiro de combustíveis movimenta mais de <strong>R$ 770 bilhões por ano</strong>, com mais de 43 mil postos revendedores. Desses, <strong>40% operam como bandeira branca</strong> — sem vínculo exclusivo com distribuidoras.</p>
              <p>Esses postos enfrentam uma <strong>assimetria de informação crônica</strong>: negociações por telefone, sem transparência de preços e com poder de barganha limitado frente às grandes distribuidoras.</p>
              <p>O mercado é dominado por três players — <strong>Vibra, Raízen e Ipiranga</strong> — que concentram 65% da distribuição. Cartéis regionais podem elevar preços em <strong>10% a 20%</strong> acima do praticado em mercados competitivos.</p>
              <p>Os processos manuais resultam em margens comprimidas, ineficiência operacional e dependência de relacionamentos pessoais para obter condições comerciais minimamente justas.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { valor: 'R$ 770 bi', label: 'Mercado anual de combustíveis no Brasil' },
              { valor: '40%', label: 'Dos postos operam como bandeira branca' },
              { valor: '10-20%', label: 'Sobrepreço estimado por práticas anticompetitivas' },
            ].map(s => (
              <div key={s.label} className="bg-[#F8F7F4] rounded-2xl p-6 border border-gray-100">
                <p className="text-3xl font-extrabold text-[#E8621A]">{s.valor}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Solução */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center">A Solução</h2>
          <p className="text-gray-500 text-center mt-2 mb-12 max-w-xl mx-auto">Marketplace B2B com leilão reverso que inverte o poder de negociação</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: 'Leilão Reverso', d: 'Mecanismo onde distribuidoras competem pelo menor preço, invertendo o poder de barganha a favor dos postos independentes.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg> },
              { t: 'Transparência', d: 'Cotações em tempo real eliminam a assimetria de informação que eleva preços nas negociações tradicionais.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { t: 'Compliance Digital', d: 'NF-e automática com ICMS, PIS e COFINS. Contratos digitais com hash SHA-256 e rastreabilidade completa.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
            ].map(f => (
              <div key={f.t} className="bg-white rounded-2xl border border-gray-100 p-8 transition-all duration-200 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] text-[#E8621A] flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.d}</p>
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
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E8621A] to-[#C44E10] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[#E8621A]/20">{p.iniciais}</div>
                <h3 className="text-lg font-semibold mt-4">{p.nome}</h3>
                <p className="text-sm text-[#E8621A]">Co-fundadora</p>
                <p className="text-xs text-gray-400">{p.curso}</p>
                <p className="text-xs text-gray-400">FGV-EAESP</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologia */}
      <section className="py-16 px-6">
        <div className="bg-gray-50 rounded-3xl max-w-4xl mx-auto py-16 text-center">
          <p className="text-sm text-gray-400 mb-6">Construído com</p>
          <div className="flex justify-center gap-4 flex-wrap px-6">
            {techs.map(t => (
              <span key={t} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-700">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white py-8 text-center">
        <p className="text-xs text-gray-300">Tanqe 2025 — FGV-EAESP</p>
      </footer>
    </div>
  )
}
