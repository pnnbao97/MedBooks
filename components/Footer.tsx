
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm mt-16">
      <div className="max-w-7xl mx-auto">
        {/* TOP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* LEFT: Branding & Socials */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="text-2xl font-bold tracking-tight hover:text-blue-300 transition-colors">
              VMedBook
            </Link>
            <p className="text-gray-300">
              Cung cấp sách y khoa chất lượng cao, bản dịch chuẩn xác cho bác sĩ, sinh viên và chuyên gia y tế.
            </p>
            <a href="mailto:vmedbooks@medai.com" className="font-semibold hover:text-blue-300 transition-colors">
              vmedbooks@medai.com
            </a>
            <a href="tel:+84921978951" className="font-semibold hover:text-blue-300 transition-colors">
              +84 921 978 951
            </a>
            <div className="flex gap-4">
              {[
                { src: "/icons/facebook.svg", alt: "Facebook", href: "https://facebook.com/vmedbook" },
                { src: "/icons/instagram.svg", alt: "Instagram", href: "https://instagram.com/vmedbook" },
                { src: "/icons/youtube.svg", alt: "YouTube", href: "https://youtube.com/vmedbook" },
                { src: "/icons/pinterest.svg", alt: "Pinterest", href: "https://pinterest.com/vmedbook" },
                { src: "/icons/x.svg", alt: "X", href: "https://x.com/vmedbook" },
              ].map((social) => (
                <a key={social.alt} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.alt}>
                  <Image
                    src={social.src}
                    alt={social.alt}
                    width={24}
                    height={24}
                    className="hover:opacity-80 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* CENTER: Navigation (Hidden on small screens) */}
          <div className="hidden lg:flex flex-col gap-6">
            <h2 className="font-semibold text-lg text-blue-200">KHÁM PHÁ</h2>
            <ul className="flex flex-col gap-3 text-gray-300">
              <li><Link href="/about" className="hover:text-blue-300 transition-colors">Về chúng tôi</Link></li>
              <li><Link href="/medtrans" className="hover:text-blue-300 transition-colors">Dự án MedTrans</Link></li>
              <li><Link href="/join-us" className="hover:text-blue-300 transition-colors">Tham gia cùng chúng tôi</Link></li>
            </ul>
          </div>
          <div className="hidden lg:flex flex-col gap-6">
            <h2 className="font-semibold text-lg text-blue-200">TÀI NGUYÊN</h2>
            <ul className="flex flex-col gap-3 text-gray-300">
              <li><Link href="/new-books" className="hover:text-blue-300 transition-colors">Sách mới</Link></li>
              <li><Link href="/featured" className="hover:text-blue-300 transition-colors">Sách nổi bật</Link></li>
              <li><Link href="/all-books" className="hover:text-blue-300 transition-colors">Tất cả sách</Link></li>
            </ul>
          </div>

          {/* RIGHT: Newsletter Signup */}
          <div className="flex flex-col gap-6">
            <h2 className="font-semibold text-lg text-blue-200">ĐĂNG KÝ</h2>
            <p className="text-gray-300">
              Nhận thông tin mới nhất về sách y khoa và ưu đãi độc quyền từ VMedBook.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Địa chỉ email"
                className="p-3 w-3/4 bg-gray-700 text-white border-none rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Địa chỉ email"
              />
              <button className="w-1/4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors">
                Tham gia
              </button>
            </form>
            <span className="font-semibold">Thanh toán an toàn</span>
            <div className="flex gap-3">
              {[
                { src: "/icons/discover.svg", alt: "Discover" },
                { src: "/icons/skrill.svg", alt: "Skrill" },
                { src: "/icons/paypal.svg", alt: "PayPal" },
                { src: "/icons/mastercard.svg", alt: "MasterCard" },
                { src: "/icons/visa.svg", alt: "Visa" },
              ].map((payment) => (
                <Image
                  key={payment.alt}
                  src={payment.src}
                  alt={payment.alt}
                  width={32}
                  height={20}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 border-t border-gray-700 pt-6">
          <div className="text-gray-400">© 2025 VMedBook. All rights reserved.</div>
          <div className="text-gray-400">
            <span className="mr-2">Ngôn ngữ:</span>
            <span className="font-medium">Tiếng Việt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;