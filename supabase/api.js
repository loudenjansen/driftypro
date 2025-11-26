export async function createCrew(name){
  const client = window?.supabaseClient
  if(!client) throw new Error('Supabase client missing')
  if(!name || !name.trim()) throw new Error('Crewnaam is vereist')
  const payload = { name: name.trim() }
  const { data, error } = await client.from('crews').insert(payload).select().single()
  if(error) throw error
  return data
}
