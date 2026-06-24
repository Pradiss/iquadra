import type { CookieOptions, Request, Response } from "express";
import type { Session } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { env } from "../config/env";

export const ACCESS_TOKEN_COOKIE = "playfy_sb_access_token";
export const REFRESH_TOKEN_COOKIE = "playfy_sb_refresh_token";
export const CSRF_TOKEN_COOKIE = "playfy_csrf_token";
export const KEEP_LOGGED_IN_COOKIE = "playfy_keep_logged_in";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type SetAuthCookiesOptions = {
  persistent?: boolean;
};

function cookieOptions(maxAge?: number): CookieOptions {
  const configuredSecure =
    env.AUTH_COOKIE_SECURE ?? env.NODE_ENV === "production";

  const secure = configuredSecure || env.AUTH_COOKIE_SAME_SITE === "none";

  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: "/",
  };

  if (typeof maxAge === "number") {
    options.maxAge = maxAge;
  }

  if (env.AUTH_COOKIE_DOMAIN) {
    options.domain = env.AUTH_COOKIE_DOMAIN;
  }

  return options;
}

function csrfCookieOptions(maxAge?: number): CookieOptions {
  return {
    ...cookieOptions(maxAge),
    httpOnly: false,
  };
}

export function setAuthCookies(
  res: Response,
  session: Session,
  options: SetAuthCookiesOptions = {},
) {
  const persistent = options.persistent === true;

  const accessTokenMaxAge = persistent
    ? (session.expires_in || 3600) * 1000
    : undefined;

  const refreshTokenMaxAge = persistent ? THIRTY_DAYS_MS : undefined;
  const csrfTokenMaxAge = persistent ? THIRTY_DAYS_MS : undefined;

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    session.access_token,
    cookieOptions(accessTokenMaxAge),
  );

  res.cookie(
    REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    cookieOptions(refreshTokenMaxAge),
  );

  res.cookie(
    CSRF_TOKEN_COOKIE,
    randomBytes(32).toString("hex"),
    csrfCookieOptions(csrfTokenMaxAge),
  );

  if (persistent) {
    res.cookie(KEEP_LOGGED_IN_COOKIE, "true", cookieOptions(THIRTY_DAYS_MS));
  } else {
    res.clearCookie(KEEP_LOGGED_IN_COOKIE, cookieOptions(0));
  }
}

export function clearAuthCookies(res: Response) {
  const options = cookieOptions(0);

  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
  res.clearCookie(CSRF_TOKEN_COOKIE, csrfCookieOptions(0));
  res.clearCookie(KEEP_LOGGED_IN_COOKIE, options);
}

export function getAuthCookie(req: Request, name: string) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[name];
}

function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = chunk.trim().split("=");
    const name = rawName?.trim();

    if (!name) {
      continue;
    }

    cookies[name] = decodeURIComponent(rawValue.join("="));
  }

  return cookies;
}
