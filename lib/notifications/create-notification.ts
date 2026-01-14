"use server"

import { createServiceRoleClient } from '@/lib/supabase/service'

export type NotificationType = 'assignment' | 'mention' | 'reply' | 'status_change' | 'system'

interface CreateNotificationParams {
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

/**
 * Create a notification for an admin user
 * Uses service role client to bypass RLS
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    }

    return { success: true, notification: data }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error }
  }
}

/**
 * Create notifications for multiple users at once
 */
export async function createBulkNotifications(
  user_ids: string[],
  params: Omit<CreateNotificationParams, 'user_id'>
) {
  try {
    const supabase = createServiceRoleClient()
    
    const notifications = user_ids.map(user_id => ({
      user_id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
    }))

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('Error creating bulk notifications:', error)
      throw error
    }

    return { success: true, notifications: data }
  } catch (error) {
    console.error('Failed to create bulk notifications:', error)
    return { success: false, error }
  }
}

/**
 * Notify all admins with a specific role
 */
export async function notifyAdminsByRole(
  roles: string[],
  params: Omit<CreateNotificationParams, 'user_id'>
) {
  try {
    const supabase = createServiceRoleClient()
    
    // Get all active admins with specified roles
    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .in('role', roles)
      .eq('is_active', true)

    if (adminError || !admins || admins.length === 0) {
      console.error('No admins found with specified roles:', roles)
      return { success: false, error: 'No admins found' }
    }

    const user_ids = admins.map(admin => admin.user_id)
    return await createBulkNotifications(user_ids, params)
  } catch (error) {
    console.error('Failed to notify admins by role:', error)
    return { success: false, error }
  }
}
