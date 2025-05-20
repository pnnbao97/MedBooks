import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="py-24 px-4 md:px-8 lg:px-16 xl:32 2xl:px-64 bg-dark-500 text-light-300 text-sm mt-24">
      {/* TOP */}
      <div className="flex flex-col md:flex-row justify-between gap-24">
        {/* LEFT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <Link href="/">
            <div className="text-2xl tracking-wide">MedBooks</div>
          </Link>
          <p>
            MedBooks và MedTrans là các nhánh con của dự án MedAI
          </p>
          <span className="font-semibold">medbooks@medai.com</span>
          <span className="font-semibold">+84 921 978 951</span>
          <div className="flex gap-6">
            <Image src="/facebook.png" alt="" width={16} height={16} />
            <Image src="/instagram.png" alt="" width={16} height={16} />
            <Image src="/youtube.png" alt="" width={16} height={16} />
            <Image src="/pinterest.png" alt="" width={16} height={16} />
            <Image src="/x.png" alt="" width={16} height={16} />
          </div>
        </div>
        {/* CENTER */}
        <div className="hidden lg:flex justify-between w-1/2">
          <div className="flex flex-col gap-9">
            <h1 className="font-medium text-lg">KHÁM PHÁ</h1>
            <div className="flex flex-col gap-6">
              <Link href="">Về chúng tôi</Link>
              <Link href="">Dự án MedTrans</Link>
              
              <Link href="">Tham gia cùng chúng tôi</Link>

            </div>
          </div>
          <div className="flex flex-col gap-9">
            <h1 className="font-medium text-lg">TÀI NGUYÊN</h1>
            <div className="flex flex-col gap-6">
              <Link href="">Sách mới</Link>
              <Link href="">Sách nổi bật</Link>
              <Link href="">Tất cả sách</Link>

            </div>
          </div>
          <div className="flex flex-col gap-9">
            <h1 className="font-medium text-lg">HỖ TRỢ</h1>
            <div className="flex flex-col gap-6">
              <Link href="">Dịch vụ khách hàng</Link>
              <Link href="">Tài khoản</Link>
              <Link href="">Câu hỏi thường gặp</Link>

            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <h1 className="font-medium text-lg">ĐĂNG KÝ</h1>
          <p>
            Hãy là người đầu tiên nhận thông báo về sách mới từ MedBooks
          </p>
          <div className="flex text-dark-100">
            <input
              type="text"
              placeholder="Địa chỉ email"
              className="p-4 w-3/4"
            />
            <button className="w-1/4 bg-lama text-white">Tham gia</button>
          </div>
          <span className="font-semibold">Thanh toán an toàn</span>
          <div className="flex justify-between">
            <Image src="/discover.png" alt="" width={40} height={20} />
            <Image src="/skrill.png" alt="" width={40} height={20} />
            <Image src="/paypal.png" alt="" width={40} height={20} />
            <Image src="/mastercard.png" alt="" width={40} height={20} />
            <Image src="/visa.png" alt="" width={40} height={20} />
          </div>
        </div>
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-16">
        <div className="">© 2025 MedBooks</div>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="">
            <span className="text-gray-500 mr-4">Ngôn ngữ</span>
            <span className="font-medium">Tiếng Việt</span>
          </div>
          {/* <div className="">
            <span className="text-gray-500 mr-4">Currency</span>
            <span className="font-medium">$ USD</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Footer;