"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import CartModal from './CartModal';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useCartStore } from "@/hooks/cartStore";
import { CircleUser, BellRing, ShoppingCart } from "lucide-react";

const NavIcons = () => {
  const { user } = useUser();
  const { totalItems, fetchCart, isLoading } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Refs để detect click outside
  const cartRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // Handle click outside để đóng cart và notification
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng cart nếu click bên ngoài
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      
      // Đóng notification nếu click bên ngoài
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isCartOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, isNotificationOpen]);

  return (
    <div className="flex items-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 relative">
      {/* Clerk Authentication */}
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-blue-200 hover:text-white py-1 rounded-md transition-colors text-sm flex items-center gap-2">
            <span className="block lg:hidden">
             <CircleUser color="white" size={22}/>
            </span>
            <span className="hidden lg:block">Đăng nhập</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-white shadow-lg",
                userButtonPopoverActionButton: "hover:bg-gray-100"
              }
            }}
            afterSignOutUrl="/"
          />
        </div>
      </SignedIn>

      {/* Notification */}
      <div className="relative" ref={notificationRef}>
        <BellRing 
          color="white" 
          size={22} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsNotificationOpen((prev) => !prev)}
        />
        
        {/* Notification Modal */}
        {isNotificationOpen && (
          <div className="absolute right-0 top-8 w-64 bg-white rounded-lg shadow-lg border z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Thông báo</h3>
              <button 
                onClick={() => setIsNotificationOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              Chưa có thông báo nào
            </div>
          </div>
        )}
      </div>
      
      {/* Cart */}
      <div className="relative" ref={cartRef}>
        <div
          className="relative cursor-pointer"
          onClick={() => setIsCartOpen((prev) => !prev)}
        >
          <ShoppingCart 
            color="white" 
            size={22} 
            className="hover:opacity-80 transition-opacity"
          />
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#F35C7A] rounded-full text-white text-sm flex items-center justify-center">
            {isLoading ? '...' : totalItems}
          </div>
        </div>
        {isCartOpen && <CartModal />}
      </div>
    </div>
  );
};

export default NavIcons;