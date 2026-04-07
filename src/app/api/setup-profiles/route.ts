import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const profilesMap: Record<string, Record<string, unknown>> = {
    'isabela@fuelbid.com': {
      tipo: 'posto',
      nome: 'Isabela Garcia',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.561,
      lng: -46.656,
      score: 5.0,
    },
    'leticia@fuelbid.com': {
      tipo: 'posto',
      nome: 'Letícia Dias',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.558,
      lng: -46.662,
      score: 5.0,
    },
    'laura@fuelbid.com': {
      tipo: 'posto',
      nome: 'Laura Borin',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.565,
      lng: -46.650,
      score: 5.0,
    },
    'fuelbid@fuelbid.com': {
      tipo: 'posto',
      nome: 'FuelBid Institucional',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.555,
      lng: -46.640,
      score: 5.0,
    },
    'posto@fuelbid.com': {
      tipo: 'posto',
      nome: 'Auto Posto Estrela do Sul LTDA',
      cnpj: '12.345.678/0001-90',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.589,
      lng: -46.635,
      bandeira: 'Bandeira Branca',
      volume_mensal: 45000,
      combustiveis: ['Gasolina Comum', 'Diesel S-10', 'Etanol Hidratado'],
      score: 4.6,
      total_deals: 23,
    },
    'distribuidora@fuelbid.com': {
      tipo: 'distribuidora',
      nome: 'PetroBrasil Distribuidora S.A.',
      cnpj: '34.567.890/0001-12',
      cidade: 'São Paulo',
      estado: 'SP',
      lat: -23.550,
      lng: -46.648,
      regiao_atuacao: ['Grande São Paulo', 'Interior SP', 'Litoral SP'],
      capacidade_logistica: '450.000 L/dia',
      combustiveis: ['Gasolina Comum', 'Gasolina Aditivada', 'Etanol Hidratado', 'Diesel S-10', 'Diesel S-500'],
      score: 4.7,
      total_deals: 87,
    },
  }

  const results: { email: string; status: string; error?: string }[] = []

  // Fetch all users by listing profiles and matching
  // Since we can't list auth users with anon key, we'll use the email mapping
  // The user IDs need to come from auth — we'll try to sign in to get them,
  // or we look up existing profiles

  // Alternative: use supabase auth admin API if service role key available
  // For now, we'll try to find users by attempting sign-in or checking if profiles exist

  for (const [email, profileData] of Object.entries(profilesMap)) {
    // Try to get user ID by signing in (will fail but we can also check existing profiles)
    // Better approach: look up existing profiles by matching on existing data
    // Since profiles might already have the user's id linked via auth trigger,
    // let's try to find and update

    // First try: fetch all profiles and match
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, nome, tipo')

    if (existingProfiles) {
      // Find profile that might match this email's expected name
      const matching = existingProfiles.find(p => p.nome === profileData.nome)
      if (matching) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', matching.id)
        results.push({ email, status: error ? 'error' : 'updated', error: error?.message })
        continue
      }
    }

    // If no match found, try signing in to get the user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: '123456',
    })

    if (authError || !authData.user) {
      results.push({ email, status: 'auth_error', error: authError?.message || 'User not found' })
      // Sign out to clean up
      await supabase.auth.signOut()
      continue
    }

    const userId = authData.user.id

    // Upsert profile
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...profileData })

    results.push({ email, status: error ? 'error' : 'created', error: error?.message })

    // Sign out
    await supabase.auth.signOut()
  }

  return Response.json({
    message: 'Perfis configurados!',
    results,
  })
}
