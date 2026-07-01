"use client";

import { useEffect, useState } from "react";

import type { AdminContext } from "../types";
import { getAdminConfigContext } from "../lib/admin-context";

export function useAdminConfigContext() {
  const [context, setContext] = useState<AdminContext | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setContext(getAdminConfigContext());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return context;
}
