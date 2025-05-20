"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const slides = [
  {
    id: 1,
    title: "SẢN KHOA WILLIAMS",
    description: "Ấn bản tiếng Việt lần đầu có mặt tại Việt Nam. Đặt sách ngay hôm nay để nhận ưu đãi lên đến 500.000 VNĐ",
    img: "https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg",
    url: "/",
    bg: "bg-gradient-to-r from-blue-50 to-blue-500",
  },
  {
    id: 2,
    title: "CHẨN ĐOÁN VÀ ĐIỀU TRỊ NỘI KHOA CURRENT",
    description: "Cuốn sách toàn diện về Nội khoa cho các bác sĩ lâm sàng",
    img: "https://m.media-amazon.com/images/I/81-WMfeRkTL._SL1500_.jpg",
    url: "/",
    bg: "bg-gradient-to-r from-blue-50 to-blue-500",
  },
  {
    id: 3,
    title: "SÁCH GIÁO KHOA PHẪU THUẬT SABISTON",
    description: "Chuẩn mực về ngoại khoa mà bất cứ bác sĩ phẫu thuật nào cũng cần đọc",
    img: "https://m.media-amazon.com/images/I/81urGNyaqIL._SL1500_.jpg",
    url: "/",
    bg: "bg-gradient-to-r from-red-100 to-red-900",
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef(null);

  // Tự động chuyển slide sau 5 giây (có thể bỏ comment phần này nếu cần)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý sự kiện cảm ứng cho thiết bị di động
  const handleTouchStart = (e: any) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    setTouchEnd(e.touches[0].clientX);
    
    // Tính toán vị trí kéo tạm thời để tạo hiệu ứng kéo theo
    const diff = touchStart - e.touches[0].clientX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    // Chỉ chuyển slide khi kéo đủ xa (> 50px)
    if (touchStart - touchEnd > 50) {
      // Vuốt sang trái -> chuyển tới slide tiếp theo
      setCurrent(current === slides.length - 1 ? 0 : current + 1);
    }

    if (touchStart - touchEnd < -50) {
      // Vuốt sang phải -> chuyển về slide trước
      setCurrent(current === 0 ? slides.length - 1 : current - 1);
    }
    
    // Reset offset kéo
    setDragOffset(0);
  };

  // Xử lý sự kiện chuột cho máy tính
  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    
    // Tính offset kéo để tạo hiệu ứng kéo theo
    const diff = dragStart - e.clientX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    // Chỉ chuyển slide khi kéo đủ xa (> 50px)
    if (dragOffset > 50) {
      // Kéo sang trái -> chuyển tới slide tiếp theo
      setCurrent(current === slides.length - 1 ? 0 : current + 1);
    } else if (dragOffset < -50) {
      // Kéo sang phải -> chuyển về slide trước
      setCurrent(current === 0 ? slides.length - 1 : current - 1);
    }
    
    // Reset trạng thái
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    // Đảm bảo huỷ trạng thái kéo khi chuột rời khỏi vùng slider
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden">
      <div
        ref={sliderRef}
        className="w-max h-full flex transition-all ease-in-out duration-300"
        style={{ 
          transform: `translateX(calc(-${current * 100}vw - ${dragOffset}px))`,
          cursor: isDragging ? "grabbing" : "grab"
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {slides.map((slide) => (
          <div
            className={`${slide.bg} w-screen h-full flex flex-col gap-16 xl:flex-row select-none`}
            key={slide.id}
          >
            {/* TEXT CONTAINER */}
            <div className="mt-10 h-1/2 xl:w-1/2 xl:h-full flex flex-col items-center justify-center gap-8 2xl:gap-12 text-center">
              <h2 className="text-xl lg:text-2xl 2xl:text-4xl text-blue-950 font-sans">
                {slide.description}
              </h2>
              <h1 className="capitalize text-5xl lg:text-6xl 2xl:text-8xl font-semibold text-blue-900">
                {slide.title}
              </h1>
              <Link href={slide.url}>
                <button className="rounded-md bg-blue-900 text-white py-3 px-4">
                  ĐẶT SÁCH NGAY
                </button>
              </Link>
            </div>
            {/* IMAGE CONTAINER */}
            <div className="h-full w-full xl:w-1/2 xl:h-full relative aspect-[16/9]">
              <Image
                src={slide.img}
                alt=""
                fill
                sizes="100%"
                className="object-contain"
                draggable="false"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute m-auto left-1/2 bottom-8 flex gap-4">
        {slides.map((slide, index) => (
          <div
            className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer flex items-center justify-center ${
              current === index ? "scale-150" : ""
            }`}
            key={slide.id}
            onClick={() => setCurrent(index)}
          >
            {current === index && (
              <div className="w-[6px] h-[6px] bg-gray-600 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;