// components/CheckoutClient.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Tag, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Truck,
  Phone,
  Mail,
  User,
  Home,
  Shield,
  Gift,
  Stethoscope,
  Check,
  Heart,
  Plus,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { createOrder, validateCoupon } from '@/lib/checkout';
import { useCartStore } from '@/hooks/cartStore';
import { useCheckoutForm, FormErrors } from '@/hooks/useCheckoutForm';
import { useCouponValidation } from '@/hooks/useCouponValidation';
import type { CartItemWithBook, CheckoutData, OrderSummary, ShippingAddress } from '@/lib/checkout';
import { calculateItemPrice, calculateOrderSummary } from '@/lib/pricing';
import { formatVND } from '@/lib/utils/currency';

interface CheckoutClientProps {
  userId: string;
  savedAddresses: ShippingAddress[];
}

type PaymentMethod = 'COD' | 'BANKING';

const CheckoutClient = ({ userId, savedAddresses: initialSavedAddresses }: CheckoutClientProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { items: cartItems, fetchCart } = useCartStore();
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(initialSavedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialSavedAddresses.find((addr) => addr.isDefault)?.id ||
      (initialSavedAddresses.length > 0 ? initialSavedAddresses[0].id : null),
  );
  const [useNewAddress, setUseNewAddress] = useState(initialSavedAddresses.length === 0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize checkout form
  const initialCheckoutData: CheckoutData = {
    customerInfo: {
      fullName: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: '',
      address: '',
      city: 'Hồ Chí Minh',
      district: '',
      ward: '',
      notes: '',
    },
    paymentMethod: 'COD',
    saveAddress: false,
  };

  const {
    formData: checkoutData,
    errors: formErrors,
    validateForm,
    updateField,
    updatePaymentMethod,
    updateSaveAddress,
    setSubmitError,
  } = useCheckoutForm(initialCheckoutData);

  const { couponCode, setCouponCode, couponDiscount, couponError, couponLoading, validateCouponCode } =
    useCouponValidation();

  // Fetch cart items on mount
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        await fetchCart();
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, [fetchCart]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/checkout');
    }
  }, [user, isLoaded, router]);

  // Load saved address data
  useEffect(() => {
    if (savedAddresses.length > 0 && !useNewAddress && selectedAddressId) {
      const address = savedAddresses.find((addr) => addr.id === selectedAddressId);
      if (address) {
        updateField('fullName', address.fullName);
        updateField('phone', address.phone);
        updateField('email', address.email);
        updateField('address', address.address);
        updateField('city', address.city);
        updateField('district', address.district);
        updateField('ward', address.ward || '');
      }
    } else if (useNewAddress) {
      updateField('fullName', user?.fullName || '');
      updateField('email', user?.primaryEmailAddress?.emailAddress || '');
      updateField('phone', '');
      updateField('address', '');
      updateField('district', '');
      updateField('ward', '');
      updateField('notes', '');
    }
  }, [selectedAddressId, useNewAddress, savedAddresses, user, updateField]);

  const orderSummary = useMemo(() => {
    if (cartItems.length > 0) {
      return calculateOrderSummary(cartItems, couponDiscount);
    }
    return null;
  }, [cartItems, couponDiscount]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !orderSummary || !user?.id) return;

    try {
      let couponData;
      if (couponDiscount > 0 && couponCode) {
        const result = await validateCoupon(couponCode, orderSummary.subtotal);
        couponData = result.coupon;
      }

      const order = await createOrder(user.id, checkoutData, orderSummary, couponData);
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setSubmitError('Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    if (value === 'COD' || value === 'BANKING') {
      updatePaymentMethod(value as PaymentMethod);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-slate-200 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            {/* <Stethoscope className="w-10 h-10 text-white" /> */}
            <Image
                  src="/favicon.ico"
                  alt="VMedBook Logo"
                  width={60}
                  height={60}
                  className="object-cover" />
          </div>
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
          <p className="text-slate-700 font-medium text-lg">Đang tải thông tin thanh toán...</p>
          <p className="text-slate-500 text-sm mt-2">VMedBook</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex flex-col items-center justify-center px-4">
        <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
          <BookOpen className="w-16 h-16 text-slate-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Giỏ hàng trống</h1>
        <p className="text-slate-600 mb-8 text-center max-w-lg leading-relaxed">
          Hãy khám phá bộ sưu tập sách y khoa được chúng tôi dịch thuật và kiểm định kỹ lưỡng.
        </p>
        <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          <Link href="/books">
            <GraduationCap className="w-5 h-5 mr-2" />
            Khám phá ngay
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-950 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <div className="relative">
                <Image
                  src="/favicon.ico"
                  alt="VMedBook Logo"
                  width={60}
                  height={60}
                  className="object-cover" />
                {/* <Heart className="w-12 h-12 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Plus className="w-2 h-2 text-white" />
                </div> */}
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Thanh toán</h1>
            <p className="text-xl text-teal-100 font-medium">VMedBook - Nền tảng sách  và tài liệu y khoa hàng đầu Việt Nam</p>
            {/* <p className="text-lg text-cyan-200 mt-2">Hoàn tất bước cuối để sở hữu những cuốn sách được dịch và kiểm định </p> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-950 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Thông tin giao hàng</h3>
                    {/* <p className="text-teal-100 font-medium">Địa chỉ nhận sách y khoa chuyên nghiệp</p> */}
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {savedAddresses.length > 0 && (
                  <div className="space-y-6">
                    <Label className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                      <Home className="w-6 h-6 text-teal-600" />
                      Chọn địa chỉ có sẵn
                    </Label>
                    <RadioGroup
                      value={useNewAddress ? 'new' : selectedAddressId?.toString()}
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setUseNewAddress(true);
                          setSelectedAddressId(null);
                        } else {
                          setUseNewAddress(false);
                          setSelectedAddressId(parseInt(value));
                        }
                      }}
                      className="space-y-4"
                    >
                      {savedAddresses.map((address) => (
                        <div key={address.id} className="group">
                          <div className="flex items-start space-x-4 p-6 border-2 border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/50">
                            <RadioGroupItem 
                              value={address.id.toString()} 
                              id={`address-${address.id}`} 
                              className="mt-1 w-5 h-5 border-2 border-teal-500" 
                            />
                            <div className="flex-1">
                              <Label htmlFor={`address-${address.id}`} className="cursor-pointer block">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-lg font-bold text-slate-900">{address.fullName}</span>
                                  {address.isDefault && (
                                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium">
                                      <Check className="w-3 h-3 mr-1" />
                                      Mặc định
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-slate-700 mb-2 font-medium">
                                  📍 {address.address}, {address.ward && `${address.ward}, `}
                                  {address.district}, {address.city}
                                </p>
                                <p className="text-slate-600 font-medium">📞 {address.phone}</p>
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-4 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value="new" id="address-new" className="w-5 h-5 border-2 border-teal-500" />
                        <Label htmlFor="address-new" className="cursor-pointer flex items-center gap-4 text-lg font-semibold text-slate-700">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                            <Plus className="text-white text-lg font-bold" />
                          </div>
                          Sử dụng địa chỉ mới
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-8 mt-8 p-8 bg-gradient-to-br from-slate-50 to-teal-50 rounded-xl border border-teal-200">
                    <h4 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <User className="w-6 h-6 text-teal-600" />
                      Thông tin người nhận
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <User className="w-4 h-4 text-teal-600" />
                          Họ và tên *
                        </Label>
                        <Input
                          id="fullName"
                          value={checkoutData.customerInfo.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          placeholder="Nhập họ và tên"
                          className={`h-12 rounded-xl border-2 font-medium ${formErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'} transition-colors bg-white`}
                        />
                        {formErrors.fullName && <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.fullName}
                        </p>}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Phone className="w-4 h-4 text-teal-600" />
                          Số điện thoại *
                        </Label>
                        <Input
                          id="phone"
                          value={checkoutData.customerInfo.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="Nhập số điện thoại"
                          className={`h-12 rounded-xl border-2 font-medium ${formErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'} transition-colors bg-white`}
                        />
                        {formErrors.phone && <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.phone}
                        </p>}
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Mail className="w-4 h-4 text-teal-600" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={checkoutData.customerInfo.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="Nhập email"
                          className={`h-12 rounded-xl border-2 font-medium ${formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'} transition-colors bg-white`}
                        />
                        {formErrors.email && <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.email}
                        </p>}
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          Địa chỉ cụ thể *
                        </Label>
                        <Input
                          id="address"
                          value={checkoutData.customerInfo.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          placeholder="Số nhà, tên đường"
                          className={`h-12 rounded-xl border-2 font-medium ${formErrors.address ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'} transition-colors bg-white`}
                        />
                        {formErrors.address && <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.address}
                        </p>}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-sm font-semibold text-slate-700">Tỉnh/Thành phố *</Label>
                        <Input
                          id="city"
                          value={checkoutData.customerInfo.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="Tỉnh/Thành phố"
                          className="h-12 rounded-xl border-2 border-slate-300 focus:border-teal-500 transition-colors bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="district" className="text-sm font-semibold text-slate-700">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={checkoutData.customerInfo.district}
                          onChange={(e) => updateField('district', e.target.value)}
                          placeholder="Quận/Huyện"
                          className={`h-12 rounded-xl border-2 font-medium ${formErrors.district ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'} transition-colors bg-white`}
                        />
                        {formErrors.district && <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.district}
                        </p>}
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="ward" className="text-sm font-semibold text-slate-700">Phường/Xã</Label>
                        <Input
                          id="ward"
                          value={checkoutData.customerInfo.ward}
                          onChange={(e) => updateField('ward', e.target.value)}
                          placeholder="Phường/Xã (tùy chọn)"
                          className="h-12 rounded-xl border-2 border-slate-300 focus:border-teal-500 transition-colors bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Ghi chú</Label>
                        <Textarea
                          id="notes"
                          value={checkoutData.customerInfo.notes}
                          onChange={(e) => updateField('notes', e.target.value)}
                          placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                          rows={4}
                          className="rounded-xl border-2 border-slate-300 focus:border-teal-500 transition-colors resize-none bg-white font-medium"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-teal-400 transition-colors">
                          <Checkbox
                            id="saveAddress"
                            checked={checkoutData.saveAddress}
                            onCheckedChange={(checked) => updateSaveAddress(!!checked)}
                            className="w-5 h-5 border-2 border-teal-500"
                          />
                          <Label htmlFor="saveAddress" className="text-sm font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4 text-teal-600" />
                            Lưu địa chỉ này cho lần mua hàng tiếp theo
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Phương thức thanh toán</h3>
                    {/* <p className="text-slate-300 font-medium">Chọn cách thức thanh toán an toàn</p> */}
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <RadioGroup value={checkoutData.paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-6">
                  <div className="relative p-6 border-2 border-slate-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all duration-200 cursor-pointer group bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="COD" id="cod" className="w-5 h-5 border-2 border-orange-500" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Truck className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <span className="text-xl font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</span>
                              <p className="text-sm text-slate-600 mt-1 font-medium">Thanh toán bằng tiền mặt khi nhận sách</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                            Phổ biến
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="relative p-6 border-2 border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all duration-200 cursor-pointer group bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="BANKING" id="banking" className="w-5 h-5 border-2 border-teal-500" />
                      <Label htmlFor="banking" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                            <CreditCard className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <span className="text-xl font-bold text-slate-900">Chuyển khoản ngân hàng</span>
                            <p className="text-sm text-slate-600 mt-1 font-medium">Chuyển khoản qua tài khoản ngân hàng</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-red-950 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Mã giảm giá</h3>
                    {/* <p className="text-purple-100">Nhời mã để được ưu đãi đặc biệt</p> */}
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <Button
                    onClick={() => validateCouponCode(couponCode, orderSummary?.subtotal || 0)}
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {couponLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Áp dụng'}
                  </Button>
                </div>
                
                {couponError && (
                  <Alert className="mt-4 border-red-200 bg-red-50 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="text-red-700">{couponError}</AlertDescription>
                  </Alert>
                )}
                
                {couponDiscount > 0 && (
                  <Alert className="mt-4 border-green-200 bg-green-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertDescription className="text-green-700">
                      🎉 Mã giảm giá đã được áp dụng! Bạn tiết kiệm được <span className="font-semibold">{formatVND(couponDiscount)}</span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            {/* Submit Error */}
            {formErrors.submit && (
              <Alert className="mt-3" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.submit}</AlertDescription>
              </Alert>
            )}
          </div>

{/* Order Summary Sidebar */}
<div className="lg:col-span-1">
  <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden sticky top-4">
    <div className="bg-gradient-to-r from-blue-500 to-blue-950 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Đơn hàng của bạn</h3>
          <p className="text-red-100">Tổng quan các sản phẩm và chi phí</p>
        </div>
      </div>
    </div>

    <div className="p-8 space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="relative">
              <Image
                src={item.book.coverUrl}
                alt={item.book.title}
                width={60}
                height={80}
                className="object-cover rounded-lg"
              />
              <Badge className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center p-1 bg-gradient-to-r from-red-500 to-pink-500 text-white">
                {item.quantity}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base text-gray-900 truncate">{item.book.title}</h4>
              <p className="text-sm text-gray-600 mb-1">
                {item.version === 'color' ? 'Bản màu' : 'Bản photo'}
              </p>
              <p className="font-semibold text-base text-red-600">{formatVND(calculateItemPrice(item))}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-blue-200" />

      {/* Order Totals */}
      {orderSummary && (
        <div className="space-y-4">
          <div className="flex justify-between text-base text-gray-700">
            <span className="font-medium">Tạm tính</span>
            <span>{formatVND(orderSummary.subtotal)}</span>
          </div>

          <div className="flex justify-between text-base text-gray-700">
            <span className="font-medium">Phí vận chuyển</span>
            <span>
              {orderSummary.shippingFee === 0 ? (
                <span className="text-green-600 font-medium">Miễn phí</span>
              ) : (
                formatVND(orderSummary.shippingFee)
              )}
            </span>
          </div>

          {orderSummary.couponDiscount > 0 && (
            <div className="flex justify-between text-base text-green-600">
              <span className="font-medium">Giảm giá</span>
              <span>-{formatVND(orderSummary.couponDiscount)}</span>
            </div>
          )}

          <Separator className="bg-blue-200" />

          <div className="flex justify-between font-bold text-xl text-gray-900">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatVND(orderSummary.total)}</span>
          </div>
        </div>
      )}

      {/* Free Shipping Notice */}
      {orderSummary && orderSummary.subtotal < 500000 && (
        <Alert className="border-blue-200 bg-blue-50 rounded-xl">
          <Truck className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Mua thêm <span className="font-semibold">{formatVND(500000 - orderSummary.subtotal)}</span> để được miễn phí vận chuyển
          </AlertDescription>
        </Alert>
      )}

      {/* Place Order Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang xử lý...
          </>
        ) : (
          `Đặt hàng • ${orderSummary ? formatVND(orderSummary.total) : ''}`
        )}
      </Button>

      <p className="text-sm text-gray-600 text-center">
        Bằng việc đặt hàng, bạn đồng ý với{' '}
        <Link href="/terms" className="underline text-blue-600 hover:text-blue-800">
          Điều khoản dịch vụ
        </Link>{' '}
        và{' '}
        <Link href="/privacy" className="underline text-blue-600 hover:text-blue-800">
          Chính sách bảo mật
        </Link>
      </p>
    </div>
  </div>
</div>
</div>
</div>
    </div>
  );
};

export default CheckoutClient;