const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export async function api(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new Error('Could not reach the case desk. Check your connection and try again.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error?.message || 'The request could not be completed.')
  return data
}
