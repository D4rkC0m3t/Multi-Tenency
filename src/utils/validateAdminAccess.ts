/**
 * Admin Access Validation Utility
 * Validates admin session and permissions before performing admin operations
 */

import { supabase } from '../lib/supabase';

export interface AdminValidationResult {
  valid: boolean;
  errors: string[];
  uid?: string;
  role?: string;
  isPlatformAdmin?: boolean;
  isActive?: boolean;
}

/**
 * Validates that the current user has admin access
 * Matches the logic in AdminLoginPage.tsx
 */
export async function validateAdminAccess(): Promise<AdminValidationResult> {
  const errors: string[] = [];

  try {
    // 1. Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      errors.push(`Session error: ${sessionError.message}`);
      return { valid: false, errors };
    }

    if (!session) {
      errors.push('No active session - please login');
      return { valid: false, errors };
    }

    const uid = session.user.id;

    // 2. Check profile and admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_platform_admin, is_active')
      .eq('id', uid)
      .single();

    if (profileError) {
      errors.push(`Profile fetch error: ${profileError.message}`);
      return { valid: false, errors, uid };
    }

    if (!profile) {
      errors.push('No profile found for current user');
      return { valid: false, errors, uid };
    }

    // 3. Verify admin privileges (matches AdminLoginPage.tsx logic)
    const isAdmin = profile.is_platform_admin || 
                    profile.role === 'super_admin' || 
                    profile.role === 'admin';

    if (!isAdmin) {
      errors.push(`Insufficient privileges. Role: ${profile.role}, Platform Admin: ${profile.is_platform_admin}`);
      return { 
        valid: false, 
        errors, 
        uid, 
        role: profile.role,
        isPlatformAdmin: profile.is_platform_admin,
        isActive: profile.is_active
      };
    }

    // 4. Check if account is active
    if (!profile.is_active) {
      errors.push('Account is deactivated');
      return { 
        valid: false, 
        errors, 
        uid, 
        role: profile.role,
        isPlatformAdmin: profile.is_platform_admin,
        isActive: profile.is_active
      };
    }

    // All checks passed
    return {
      valid: true,
      errors: [],
      uid,
      role: profile.role,
      isPlatformAdmin: profile.is_platform_admin,
      isActive: profile.is_active
    };

  } catch (error: any) {
    errors.push(`Unexpected error: ${error.message}`);
    return { valid: false, errors };
  }
}

/**
 * Validates admin access and throws an error if invalid
 * Use this for operations that require admin access
 */
export async function requireAdminAccess(): Promise<void> {
  const result = await validateAdminAccess();
  
  if (!result.valid) {
    const errorMessage = result.errors.join(', ');
    throw new Error(`Admin access required: ${errorMessage}`);
  }
}

/**
 * Gets current admin user info
 */
export async function getCurrentAdminInfo() {
  const result = await validateAdminAccess();
  
  if (!result.valid) {
    return null;
  }

  return {
    uid: result.uid!,
    role: result.role!,
    isPlatformAdmin: result.isPlatformAdmin!,
    isActive: result.isActive!
  };
}
