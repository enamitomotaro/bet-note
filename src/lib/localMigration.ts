"use client";

import type { BetEntry } from "./types";
import { bulkInsertBetEntries } from "@/app/actions/betEntries";

export async function migrateLocalEntries(userId: string): Promise<number> {
  if (typeof window === "undefined") return 0;
  try {
    const item = window.localStorage.getItem("betEntries");
    if (!item) return 0;
    const entries: BetEntry[] = JSON.parse(item);
    if (!Array.isArray(entries) || entries.length === 0) {
      window.localStorage.removeItem("betEntries");
      return 0;
    }
    const base = entries.map(e => ({
      date: e.date,
      raceName: e.raceName,
      betAmount: e.betAmount,
      payoutAmount: e.payoutAmount,
    }));
    await bulkInsertBetEntries(userId, base);
    window.localStorage.removeItem("betEntries");
    return entries.length;
  } catch (err) {
    console.error("local migration failed", err);
    return 0;
  }
}
