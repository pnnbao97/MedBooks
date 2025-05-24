import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/database/drizzle';
import { users, userProfiles } from '@/database/schema'; // Adjust path to your schema
import { eq, and } from 'drizzle-orm';

export interface UserData {
  id: string;
  clerkId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  lastActivityDate: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string | null;
  avatarUrl?: string | null;
  birthDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  occupation?: string | null;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date | null;
}

// Lấy thông tin user từ database theo Clerk ID
export async function getUserFromDB(clerkId: string): Promise<UserData | null> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);
    
    if (!result[0]) return null;
    // Ensure role is never null
    const user = result[0];
    return user as UserData;
  } catch (error) {
    console.error('Error fetching user from DB:', error);
    return null;
  }
}

// Lấy thông tin user hiện tại (combine Clerk + DB)
export async function getCurrentUserData() {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  
  if (!userId || !clerkUser) return null;

  const dbUser = await getUserFromDB(userId);
  
  return {
    clerk: clerkUser,
    db: dbUser,
    isAdmin: dbUser?.role === 'ADMIN' || clerkUser.publicMetadata?.role === 'ADMIN'
  };
}

// Kiểm tra quyền admin
export async function isAdmin(): Promise<boolean> {
  const userData = await getCurrentUserData();
  return userData?.isAdmin || false;
}



// Lấy profile chi tiết của user
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    
    if (!result[0]) return null;
    const profile = result[0];
    return {
      ...profile,
      createdAt: profile.createdAt ?? new Date(),
      updatedAt: profile.updatedAt ?? null
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Cập nhật profile user
export async function updateUserProfile(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
  try {
    const existingProfile = await getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({ 
          ...profileData, 
          updatedAt: new Date() 
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile
      await db
        .insert(userProfiles)
        .values({
          userId,
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Lấy user với profile
export async function getUserWithProfile(userId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1);
    
    // if (!result[0]) return null;
    if (result.length === 0) return null;
    return {
      user: result[0].users,
      profile: result[0].user_profiles
    };
  } catch (error) {
    console.error('Error fetching user with profile:', error);
    return null;
  }
}

// Lấy danh sách tất cả users (dành cho admin)
export async function getAllUsers(page: number = 1, limit: number = 10) {
  const currentUserIsAdmin = await isAdmin();
  if (!currentUserIsAdmin) {
    throw new Error('Unauthorized: Only admins can view all users');
  }

  const offset = (page - 1) * limit;
  
  try {
    // Get users with their profiles
    const result = await db
      .select({
        user: users,
        profile: userProfiles
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.isActive, true))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const countResult = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isActive, true));
    
    const total = countResult.length;
    
    return {
      users: result.map(row => ({
        ...row.user,
        profile: row.profile
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

// // Tạo user mới (sync từ Clerk webhook)
// export async function createUser(clerkUser: any) {
//   try {
//     const newUser = await db
//       .insert(users)
//       .values({
//         clerkId: clerkUser.id,
//         fullName: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim(),
//         email: clerkUser.email_addresses[0]?.email_address || '',
//         phone: clerkUser.phone_numbers[0]?.phone_number || null,
//         role: 'USER',
//         status: 'APPROVED',
//         isActive: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       })
//       .returning();
      
//     return newUser[0];
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw error;
//   }
// }

// Soft delete user
export async function softDeleteUser(userId: string) {
  const currentUserIsAdmin = await isAdmin();
  if (!currentUserIsAdmin) {
    throw new Error('Unauthorized: Only admins can delete users');
  }

  try {
    await db
      .update(users)
      .set({ 
        isActive: false, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
}