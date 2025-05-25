"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartModal from './CartModal';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useCartStore } from "@/hook/cartStore";

const NavIcons = () => {
  const { user } = useUser();
  const { totalItems, fetchCart, isLoading } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return (
    <div className="flex items-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 relative">
      {/* Clerk Authentication */}
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-blue-200 hover:text-white py-1 rounded-md transition-colors text-sm flex items-center gap-2">
            <span className="block lg:hidden">
              <Image
                src="/profile.png"
                alt="User"
                width={22}
                height={22}
                className="cursor-pointer"
              />
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
      <Image
        src="/notification.png"
        alt=""
        width={22}
        height={22}
        className="cursor-pointer"
      />
      
      {/* Cart */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsCartOpen((prev) => !prev)}
      >
        <Image src="/cart.png" alt="Giỏ hàng" width={22} height={22} />
        <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#F35C7A] rounded-full text-white text-sm flex items-center justify-center">
          {isLoading ? '...' : totalItems}
        </div>
      </div>
      {isCartOpen && <CartModal />}
    </div>
  );
};

export default NavIcons;