// Assignable staff roles (a team member may hold any of these).
export const STAFF_ROLES = ['super_admin', 'booking_manager', 'content_manager'];

// Access management is staff-only: a traveler (customer) account is a public
// self-registration with no console access to grant or revoke, and a role change
// may only target a real staff role. Returns an HTTP error, or null when allowed.
export function roleChangeError(targetRole, nextRole) {
  if (targetRole === 'customer') {
    return { status: 403, message: 'Traveler accounts have no console access to change.' };
  }
  if (!STAFF_ROLES.includes(nextRole)) {
    return { status: 400, message: 'Invalid team role.' };
  }
  return null;
}
