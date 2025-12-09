/**
 * User utility functions for role and clearance checks
 */

export function getUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      email: payload.email || payload.user,
      role: payload.role,
      clearance: payload.clearance || 0,
      department: payload.department,
    };
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}

export function isAdmin(user) {
  if (!user) return false;
  return user.role === "Admin" || user.clearance >= 5;
}

export function hasClearance(user, requiredClearance) {
  if (!user) return false;
  return user.clearance >= requiredClearance;
}

export function hasRole(user, requiredRoles) {
  if (!user) return false;
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  return user.role === requiredRoles;
}

export function canViewDevicePolicyContext(user) {
  if (!user) return false;
  // Admin, Security, and users with clearance >= 3 can view
  return isAdmin(user) || 
         user.role === "Security" || 
         hasClearance(user, 3);
}

