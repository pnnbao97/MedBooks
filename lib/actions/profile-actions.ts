'use server';

import { updateUserProfile } from '@/lib/user-utils';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface UpdateProfileData {
  userId: string;
  phone?: string;
  address?: string;
  bio?: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  occupation?: string;
}

export async function updateProfileAction(data: UpdateProfileData) {
  try {
    const { userId, phone, address, bio, birth_date, gender, occupation } = data;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Update user basic info (phone, address) in users table
    if (phone || address) {
      await db
        .update(users)
        .set({
          phone: phone || null,
          address: address || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update user profile info using the utility function
    await updateUserProfile(userId, {
      bio: bio || null,
      birthDate: birth_date || null,
      gender: gender ? gender : null,
      occupation: occupation || null,
    });

    // Revalidate the profile page to show updated data
    revalidatePath('/profile');
    
    return { success: true, message: 'Cập nhật thông tin thành công!' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      message: 'Có lỗi xảy ra khi cập nhật thông tin!',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}