// Severa AI Security Platform - Live Supabase Admin Service
// Real-time bidirectional connection to Supabase tables, storage buckets, and auth users.

import { supabase } from './supabaseClient.js';
import { decompressData, compressData } from '../utils/compressionEngine.js';
import { ADMIN_CONFIG } from '../constants/config.js';

export const adminService = {
  /**
   * Validates if current user email or provided master PIN is authorized for Admin access.
   */
  verifyAdminAccess(userEmail, enteredPin) {
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const pin = (enteredPin || '').trim();

    // Check PIN first
    const isPinValid = pin === ADMIN_CONFIG.masterPin;

    // Check email
    const isEmailAdmin = ADMIN_CONFIG.adminEmails.some(
      (e) => e.toLowerCase() === cleanEmail
    );

    if (ADMIN_CONFIG.allowMasterPinAccess && isPinValid) {
      return { authorized: true, reason: 'PIN Verified' };
    }

    if (isEmailAdmin && isPinValid) {
      return { authorized: true, reason: 'Admin Email & PIN Verified' };
    }

    return { authorized: false, reason: 'Invalid Admin Credentials' };
  },

  /**
   * Fetches all live records from public.workspaces with decompressed preview.
   */
  async getLiveWorkspaces() {
    if (!supabase || typeof supabase.from !== 'function') {
      return { data: [], error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('last_saved_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      // Enrich rows with decompressed project file previews & statistics
      const enriched = await Promise.all(
        (data || []).map(async (row) => {
          let decompressed = null;
          let fileCount = 0;
          let folderNames = [];

          if (row.compressed_data) {
            try {
              decompressed = await decompressData(row.compressed_data);
              if (decompressed) {
                folderNames = (decompressed.projectFolders || []).map((p) => p.name);
                fileCount = (decompressed.projectFolders || []).reduce(
                  (acc, p) => acc + (p.files?.length || 0),
                  0
                );
              }
            } catch {}
          }

          return {
            ...row,
            decompressed,
            fileCount,
            folderNames
          };
        })
      );

      return { data: enriched, error: null };
    } catch (e) {
      return { data: [], error: e.message };
    }
  },

  /**
   * Updates a workspace record live in Supabase.
   * If updatedSnapshot is provided, automatically recompresses and calculates byte metrics.
   */
  async updateWorkspaceRecord(id, updates, updatedSnapshot = null) {
    if (!supabase) return { error: 'Supabase client missing' };

    try {
      let finalUpdates = { ...updates, last_saved_at: new Date().toISOString() };

      if (updatedSnapshot) {
        const comp = await compressData(updatedSnapshot);
        if (comp) {
          finalUpdates.compressed_data = comp.compressedBase64;
          finalUpdates.compressed_bytes = comp.compressedBytes;
          finalUpdates.uncompressed_bytes = comp.originalBytes;
          finalUpdates.compression_ratio = comp.ratio;
        }
      }

      const { data, error } = await supabase
        .from('workspaces')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      return { data, error: error?.message || null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  },

  /**
   * Deletes a workspace record from Supabase.
   */
  async deleteWorkspaceRecord(id) {
    if (!supabase) return { error: 'Supabase client missing' };

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      return { error: error?.message || null };
    } catch (e) {
      return { error: e.message };
    }
  },

  /**
   * Fetches rows from an arbitrary Supabase table dynamically.
   */
  async getTableRows(tableName, limit = 50) {
    if (!supabase) return { data: [], error: 'Supabase client missing' };

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit);

      return { data: data || [], error: error?.message || null };
    } catch (e) {
      return { data: [], error: e.message };
    }
  },

  /**
   * Updates an arbitrary row in any Supabase table.
   */
  async updateTableRow(tableName, primaryKeyField, primaryKeyValue, updates) {
    if (!supabase) return { error: 'Supabase client missing' };

    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq(primaryKeyField, primaryKeyValue)
        .select()
        .single();

      return { data, error: error?.message || null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  },

  /**
   * Inserts a new row into an arbitrary Supabase table.
   */
  async insertTableRow(tableName, row) {
    if (!supabase) return { error: 'Supabase client missing' };

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(row)
        .select()
        .single();

      return { data, error: error?.message || null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  },

  /**
   * Deletes a row from an arbitrary Supabase table.
   */
  async deleteTableRow(tableName, primaryKeyField, primaryKeyValue) {
    if (!supabase) return { error: 'Supabase client missing' };

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(primaryKeyField, primaryKeyValue);

      return { error: error?.message || null };
    } catch (e) {
      return { error: e.message };
    }
  },

  /**
   * Lists Supabase Storage Buckets and their objects.
   */
  async getStorageBuckets() {
    if (!supabase || !supabase.storage) return { buckets: [], error: null };

    try {
      const { data, error } = await supabase.storage.listBuckets();
      return { buckets: data || [], error: error?.message || null };
    } catch (e) {
      return { buckets: [], error: e.message };
    }
  },

  /**
   * Executes a direct SQL query or RPC function if available.
   */
  async executeRawQuery(sqlQuery) {
    if (!supabase) return { data: null, error: 'Supabase client missing' };

    try {
      // Supabase supports rpc('execute_sql', { sql: ... }) when defined in database
      const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery });
      if (error) {
        return { data: null, error: error.message };
      }
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }
};
