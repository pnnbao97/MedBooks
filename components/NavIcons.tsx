"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartModal from './CartModal';
import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton,
  useUser 
} from "@clerk/nextjs";

const NavIcons = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className="flex items-center gap-4 xl:gap-6 relative">
      {/* Clerk Authentication */}
      <div className="flex items-center gap-2">
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="text-blue-200 hover:text-white px-3 py-1 rounded-md hover:bg-blue-800 transition-colors text-sm">
                Đăng nhập
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors text-sm">
                Đăng ký
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex items-center gap-2">
            <span className="text-blue-200 text-sm hidden md:block">
              Xin chào, {user?.firstName || 'Bạn'}!
            </span>
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
      </div>

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
        <Image src="/cart.png" alt="" width={22} height={22} />
        <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#F35C7A] rounded-full text-white text-sm flex items-center justify-center">
          2
        </div>
      </div>
      {isCartOpen && <CartModal />}
    </div>
  );
};

export default NavIcons;