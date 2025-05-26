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
  User
} from 'lucide-react';
import { 
  validateCoupon, 
  createOrder
} from '@/lib/checkout';
import type { CartItemWithBook, CheckoutData, OrderSummary, ShippingAddress } from '@/lib/checkout';

interface CheckoutClientProps {
  cartItems: CartItemWithBook[];
  savedAddresses: ShippingAddress[];
}

// Fix: Move formatVND function to client-side
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

  // Fix: Calculate item price consistently
  const calculateItemPrice = (item: CartItemWithBook): number => {
    const basePrice = item.version === 'color' 
      ? (item.book.hasColorSale 
          ? (item.book.colorPrice - item.book.colorSaleAmount) * 1000
          : item.book.colorPrice * 1000)
      : item.book.photoPrice * 1000;
    
    return basePrice * item.quantity;
  };
  
// Calculate order summary
export function calculateOrderSummary(
  items: CartItemWithBook[], 
  couponDiscount: number = 0
): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  return {
    subtotal,
    shippingFee,
    couponDiscount,
    total,
    items
  };
}

const CheckoutClient = ({ cartItems: initialCartItems, savedAddresses: initialSavedAddresses }: CheckoutClientProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // State management
  const [cartItems, setCartItems] = useState<CartItemWithBook[]>(initialCartItems);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(initialSavedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialSavedAddresses.find(addr => addr.isDefault)?.id || 
    (initialSavedAddresses.length > 0 ? initialSavedAddresses[0].id : null)
  );
  const [useNewAddress, setUseNewAddress] = useState(initialSavedAddresses.length === 0);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customerInfo: {
      fullName: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: '',
      address: '',
      city: 'Hồ Chí Minh',
      district: '',
      ward: '',
      notes: ''
    },
    paymentMethod: 'COD',
    saveAddress: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/checkout');
    }
  }, [user, isLoaded, router]);

  
const orderSummary = useMemo(() => {
  if (cartItems.length > 0) {
    return calculateOrderSummary(cartItems, couponDiscount);
  }
  return null;
}, [cartItems, couponDiscount]);

  // Load saved address data
  useEffect(() => {
    if (savedAddresses.length > 0 && !useNewAddress && selectedAddressId) {
      const address = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (address) {
        setCheckoutData(prev => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            fullName: address.fullName,
            phone: address.phone,
            email: address.email,
            address: address.address,
            city: address.city,
            district: address.district,
            ward: address.ward || ''
          }
        }));
      }
    } else if (useNewAddress) {
      setCheckoutData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          fullName: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          phone: '',
          address: '',
          district: '',
          ward: '',
          notes: ''
        }
      }));
    }
  }, [selectedAddressId, useNewAddress, savedAddresses, user]);

  // Fix: Handle coupon validation with proper error handling
  const handleCouponValidation = async () => {
    if (!couponCode.trim() || !orderSummary) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const result = await validateCoupon(couponCode, orderSummary.subtotal);
      if (result.valid && result.discountAmount) {
        setCouponDiscount(result.discountAmount);
        setCouponError('');
      } else {
        setCouponError(result.error || 'Mã giảm giá không hợp lệ');
        setCouponDiscount(0);
      }
    } catch (error) {
      setCouponError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!checkoutData.customerInfo.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!checkoutData.customerInfo.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(checkoutData.customerInfo.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!checkoutData.customerInfo.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(checkoutData.customerInfo.phone.replace(/\D/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!checkoutData.customerInfo.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!checkoutData.customerInfo.district.trim()) {
      errors.district = 'Vui lòng chọn quận/huyện';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !orderSummary || !user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      let couponData;
      if (couponDiscount > 0) {
        const result = await validateCoupon(couponCode, orderSummary.subtotal);
        couponData = result.coupon;
      }
      
      const order = await createOrder(user.id, checkoutData, orderSummary, couponData);
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setCouponError('Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CheckoutData['customerInfo'], value: string) => {
    setCheckoutData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setCheckoutData(prev => ({ ...prev, saveAddress: checked }));
  };



  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-6">Hãy thêm sách vào giỏ hàng để tiếp tục thanh toán</p>
        <Button asChild>
          <Link href="/books">Khám phá sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Chọn địa chỉ có sẵn</Label>
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
                    >
                      {savedAddresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={`address-${address.id}`} className="cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.fullName}</span>
                                {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.address}, {address.ward && `${address.ward}, `}{address.district}, {address.city}
                              </p>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                            </Label>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="new" id="address-new" />
                        <Label htmlFor="address-new" className="cursor-pointer font-medium">
                          Sử dụng địa chỉ mới
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Họ và tên *
                      </Label>
                      <Input
                        id="fullName"
                        value={checkoutData.customerInfo.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Nhập họ và tên"
                        className={formErrors.fullName ? 'border-red-500' : ''}
                      />
                      {formErrors.fullName && (
                        <p className="text-sm text-red-500">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Số điện thoại *
                      </Label>
                      <Input
                        id="phone"
                        value={checkoutData.customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={checkoutData.customerInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Nhập email"
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                      <Input
                        id="address"
                        value={checkoutData.customerInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Số nhà, tên đường"
                        className={formErrors.address ? 'border-red-500' : ''}
                      />
                      {formErrors.address && (
                        <p className="text-sm text-red-500">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                      <Input
                        id="city"
                        value={checkoutData.customerInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Tỉnh/Thành phố"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">Quận/Huyện *</Label>
                      <Input
                        id="district"
                        value={checkoutData.customerInfo.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        placeholder="Quận/Huyện"
                        className={formErrors.district ? 'border-red-500' : ''}
                      />
                      {formErrors.district && (
                        <p className="text-sm text-red-500">{formErrors.district}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ward">Phường/Xã</Label>
                      <Input
                        id="ward"
                        value={checkoutData.customerInfo.ward}
                        onChange={(e) => handleInputChange('ward', e.target.value)}
                        placeholder="Phường/Xã (tùy chọn)"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <Textarea
                        id="notes"
                        value={checkoutData.customerInfo.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveAddress"
                          checked={checkoutData.saveAddress}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="saveAddress" className="text-sm">
                          Lưu địa chỉ này cho lần mua hàng tiếp theo
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={checkoutData.paymentMethod}
                  onValueChange={(value: 'COD' | 'BANKING') => 
                    setCheckoutData(prev => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="BANKING" id="banking" />
                    <Label htmlFor="banking" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Chuyển khoản ngân hàng</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Chuyển khoản qua tài khoản ngân hàng
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Coupon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCouponValidation}
                    disabled={couponLoading || !couponCode.trim()}
                    variant="outline"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Áp dụng'
                    )}
                  </Button>
                </div>
                {couponError && (
                  <Alert className="mt-3" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{couponError}</AlertDescription>
                  </Alert>
                )}
                {couponDiscount > 0 && (
                  <Alert className="mt-3">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Mã giảm giá đã được áp dụng! Bạn tiết kiệm được{' '}
                      {formatVND(couponDiscount)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Đơn hàng của bạn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <Image
                          src={item.book.coverUrl}
                          alt={item.book.title}
                          width={60}
                          height={80}
                          className="object-cover rounded"
                        />
                        <Badge className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center p-1">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.book.title}</h4>
                        <p className="text-xs text-gray-500 mb-1">
                          {item.version === 'color' ? 'Bản màu' : 'Bản photo'}
                        </p>
                        <p className="font-medium text-sm">
                          {formatVND(calculateItemPrice(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                {orderSummary && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{formatVND(orderSummary.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Phí vận chuyển</span>
                      <span>
                        {orderSummary.shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatVND(orderSummary.shippingFee)
                        )}
                      </span>
                    </div>
                    
                    {orderSummary.couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatVND(orderSummary.couponDiscount)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-red-600">
                        {formatVND(orderSummary.total)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Free Shipping Notice */}
                {orderSummary && orderSummary.subtotal < 500000 && (
                  <Alert>
                    <Truck className="h-4 w-4" />
                    <AlertDescription>
                      Mua thêm{' '}
                      {formatVND(500000 - orderSummary.subtotal)}{' '}
                      để được miễn phí vận chuyển
                    </AlertDescription>
                  </Alert>
                )}

                {/* Place Order Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Đặt hàng • ${orderSummary ? formatVND(orderSummary.total) : ''}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Bằng việc đặt hàng, bạn đồng ý với{' '}
                  <Link href="/terms" className="underline">Điều khoản dịch vụ</Link> và{' '}
                  <Link href="/privacy" className="underline">Chính sách bảo mật</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClient;