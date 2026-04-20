import { getCurrentUser } from "@/lib/currentUser";

/**
 * Back-compat shim for call sites that only need { id }.
 * Prefer `getCurrentUser()` directly in new code.
 */
export async function getOrCreateAnonUser() {
  return getCurrentUser();
}
