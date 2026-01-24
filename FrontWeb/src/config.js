// Configuration API (sans slash final)
const envUrl = import.meta.env.VITE_API_URL
export const API_URL = envUrl ? envUrl.replace(/\/$/, '') : 'https://flip-boardbackapi.vercel.app'
