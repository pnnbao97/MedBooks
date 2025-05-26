// page.tsx
import { getCurrentUserData, getUserProfile } from '@/lib/user-utils';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const userData = await getCurrentUserData();

  if (!userData) {
    redirect('/sign-in');
  }

  const profile = userData.db ? await getUserProfile(userData.db.id) : null;

  // Mock order data - replace with actual order fetching logic
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 1200000,
      status: 'COMPLETED',
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      total: 850000,
      status: 'PENDING',
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      total: 550000,
      status: 'CANCELLED',
    },
  ];

  // Sanitize userData, profile, and clerkData to ensure they are plain objects
  const sanitizedUserData = userData.db
    ? {
        id: userData.db.clerkId,
        phone: userData.db.phone || '',
        address: userData.db.address || '',
        status: userData.db.status || '',
      }
    : null;

  const sanitizedProfile = profile
    ? {
        bio: profile.bio || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
      }
    : null;

  const sanitizedClerkData = {
    id: userData.clerk?.id || '',
    firstName: userData.clerk?.firstName || '',
    lastName: userData.clerk?.lastName || '',
    imageUrl: userData.clerk?.imageUrl || '/default-avatar.png',
    emailAddresses: userData.clerk?.emailAddresses?.map((email: any) => ({
      emailAddress: email.emailAddress,
    })) || [],
    phoneNumbers: userData.clerk?.phoneNumbers?.map((phone: any) => ({
      phoneNumber: phone.phoneNumber,
    })) || [],
    createdAt: userData.clerk?.createdAt
      ? new Date(userData.clerk.createdAt).getTime()
      : null,
    updatedAt: userData.clerk?.updatedAt
      ? new Date(userData.clerk.updatedAt).getTime()
      : null,
  };

  return (
    <ProfileForm
      userData={sanitizedUserData}
      profile={sanitizedProfile}
      clerkData={sanitizedClerkData}
      isAdmin={userData.isAdmin}
      userId={userData.db?.clerkId}
      orders={mockOrders}
    />
  );
}