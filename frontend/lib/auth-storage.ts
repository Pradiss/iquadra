import type { AuthSessionSnapshot } from "../types/auth"

const LEGACY_TEMP_TOKEN_KEY = "iquadra:temp-token"
const TOKEN_KEY = "iquadra:token"
const SESSION_KEY = "iquadra:session"
export const AUTH_CHANGE_EVENT = "iquadra:auth-change"

function dispatchAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

function canUseStorage() {
  return typeof window !== "undefined"
}

function removeLegacyTempTokenStorage() {
  if (canUseStorage()) {
    localStorage.removeItem(LEGACY_TEMP_TOKEN_KEY)
  }
}

function removeTokenStorage() {
  if (canUseStorage()) {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function removeSessionStorage() {
  if (canUseStorage()) {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function saveTempToken(token: string) {
  saveToken(token)
}

export function getTempToken() {
  if (!canUseStorage()) {
    return null
  }

  return localStorage.getItem(LEGACY_TEMP_TOKEN_KEY)
}

export function removeTempToken() {
  removeLegacyTempTokenStorage()
  dispatchAuthChange()
}

export function saveToken(token: string) {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(TOKEN_KEY, token)
  removeLegacyTempTokenStorage()
  dispatchAuthChange()
}

export function getToken() {
  if (!canUseStorage()) {
    return null
  }

  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TEMP_TOKEN_KEY)
}

export function removeToken() {
  removeTokenStorage()
  removeLegacyTempTokenStorage()
  dispatchAuthChange()
}

export function saveSession(session: AuthSessionSnapshot) {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  dispatchAuthChange()
}

export function getSession() {
  if (!canUseStorage()) {
    return null
  }

  const rawSession = localStorage.getItem(SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSessionSnapshot
  } catch {
    removeSessionStorage()
    return null
  }
}

export function removeSession() {
  removeSessionStorage()
  dispatchAuthChange()
}

export function clearAuthStorage() {
  removeLegacyTempTokenStorage()
  removeTokenStorage()
  removeSessionStorage()
  dispatchAuthChange()
}
