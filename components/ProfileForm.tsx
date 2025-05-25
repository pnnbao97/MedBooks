// ProfileForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/lib/actions/profile-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Edit2, Save, X, User, Mail, Phone, MapPin, Calendar as CalendarIcon, Briefcase, FileText, ShoppingBag } from 'lucide-react';

interface ProfileFormProps {
  userData: any;
  profile: any;
  clerkData: any;
  isAdmin?: boolean;
  userId?: string;
  orders?: Array<{ id: string; date: string; total: number; status: string }>;
}

export default function ProfileForm({ userData, profile, clerkData, isAdmin, userId, orders = [] }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: userData?.phone || clerkData?.phoneNumbers?.[0]?.phoneNumber || '',
    address: userData?.address || '',
    bio: profile?.bio || '',
    birth_date: profile?.birthDate || '',
    gender: profile?.gender || '',
    occupation: profile?.occupation || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await updateProfileAction({
        userId: userId.toString(),
        ...formData,
      });

      if (result.success) {
        alert(result.message);
        setIsEditing(false);
        router.refresh();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field?: string
  ) => {
    if (typeof e === 'string' && field) {
      setFormData({ ...formData, [field]: e });
    } else if (typeof e !== 'string') {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PENDING': return 'Đang xử lý';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-block px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText2 = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã phê duyệt';
      case 'PENDING': return 'Chờ phê duyệt';
      case 'REJECTED': return 'Bị từ chối';
      default: return 'Không xác định';
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Không có thông tin';
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const fullName = `${clerkData?.firstName || ''} ${clerkData?.lastName || ''}`.trim() || 'Khách hàng';
  const email = clerkData?.emailAddresses?.[0]?.emailAddress || 'email@example.com';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Trang cá nhân</h1>
        <p className="text-gray-600 text-sm">Quản lí tài khoản và theo dõi đơn hàng của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-300 to-blue-900 h-32 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <img
                    src={clerkData?.imageUrl || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute top-4 right-6">
                {isAdmin && (
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>
            
            <div className="pt-14 pb-6 px-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h2>
                  <p className="text-gray-600 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Tham gia: {formatDate(clerkData?.createdAt)}</span>
                    <span>Cập nhật: {formatDate(clerkData?.updatedAt)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Thông tin chi tiết
            </h3>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="text-gray-900">{formData.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                {isEditing && (
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="max-w-xs"
                    placeholder="Số điện thoại"
                  />
                )}
              </div>

              {/* Address */}
              <div className="flex items-start justify-between py-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                    <p className="text-gray-900">{formData.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                {isEditing && (
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="max-w-xs"
                    rows={2}
                    placeholder="Địa chỉ"
                  />
                )}
              </div>

              {/* Birth Date */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
                    <p className="text-gray-900">
                      {formData.birth_date 
                        ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: vi })
                        : 'Chưa cập nhật'
                      }
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'max-w-xs justify-start text-left font-normal',
                          !formData.birth_date && 'text-muted-foreground'
                        )}
                      >
                        {formData.birth_date
                          ? format(new Date(formData.birth_date), 'dd/MM/yyyy', { locale: vi })
                          : 'Chọn ngày sinh'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.birth_date ? new Date(formData.birth_date) : undefined}
                        onSelect={(date) =>
                          handleChange(date ? format(date, 'yyyy-MM-dd') : '', 'birth_date')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Gender */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Giới tính</label>
                    <p className="text-gray-900">{getGenderText(formData.gender)}</p>
                  </div>
                </div>
                {isEditing && (
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange(value, 'gender')}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Occupation */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nghề nghiệp</label>
                    <p className="text-gray-900">{formData.occupation || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                {isEditing && (
                  <Input
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="max-w-xs"
                    placeholder="Nghề nghiệp"
                  />
                )}
              </div>

              {/* Bio */}
              <div className="flex items-start justify-between py-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Giới thiệu</label>
                    <p className="text-gray-900">{formData.bio || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                {isEditing && (
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="max-w-xs"
                    rows={3}
                    placeholder="Giới thiệu về bản thân"
                  />
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Hủy bỏ
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Account Status & Order History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Trạng thái tài khoản
            </h3>
            
            <div className="text-center py-4">
              <div className="mb-4">
                <span className={getStatusBadge(userData?.status)}>
                  {getStatusText2(userData?.status)}
                </span>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ID tài khoản:</span>
                  <span className="font-medium">#{userData?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loại tài khoản:</span>
                  <span className="font-medium">{isAdmin ? 'Admin' : 'User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order History Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              Lịch sử đơn hàng
            </h3>
            
            {orders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800 text-sm">#{order.id}</p>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          order.status === 'COMPLETED' && 'bg-green-100 text-green-700',
                          order.status === 'PENDING' && 'bg-yellow-100 text-yellow-700',
                          order.status === 'CANCELLED' && 'bg-red-100 text-red-700'
                        )}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{order.date}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {order.total.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
                <p className="text-gray-400 text-xs mt-1">Đơn hàng của bạn sẽ xuất hiện tại đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}