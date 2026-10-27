// Server-only helper for the NEAR Intents 1Click API.
// The optional JWT stays on the server (Vercel env var NEAR_INTENTS_JWT) and never reaches the browser.

const BASE_URL = (process.env.NEAR_INTENTS_BASE_URL || 'https://1click.chaindefuser.com').replace(/\/$/, '');

export async function oneClick(path, init = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers || {}) };
  if (process.env.NEAR_INTENTS_JWT) headers.Authorization = `Bearer ${process.env.NEAR_INTENTS_JWT}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers, cache: 'no-store' });
  } catch (err) {
    return { ok: false, status: 502, data: { message: 'Could not reach the swap network. Try again in a moment.' } };
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text.slice(0, 500) };
  }
  return { ok: res.ok, status: res.status, data };
}

export function confidentialityLevel() {
  const level = (process.env.NEAR_CONFIDENTIALITY || 'advanced').toLowerCase();
  return ['public', 'basic', 'advanced'].includes(level) ? level : 'advanced';
}

export function errorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.message === 'string' && data.message) return data.message;
  if (typeof data.error === 'string' && data.error) return data.error;
  if (Array.isArray(data.message)) return data.message.join(', ');
  return fallback;
}
