export const navigationLinks = [
  {
    href: "/library",
    label: "Library",
  },

  {
    img: "/icons/user.svg",
    selectedImg: "/icons/user-fill.svg",
    href: "/my-profile",
    label: "My Profile",
  },
];

export const adminSideBarLinks = [
  {
    img: "/icons/admin/home.svg",
    route: "/admin",
    text: "Trang chủ",
  },
  {
    img: "/icons/admin/users.svg",
    route: "/admin/users",
    text: "Thành viên",
  },
  {
    img: "/icons/admin/book.svg",
    route: "/admin/books",
    text: "Kho sách",
  },
  {
    img: "/icons/admin/bookmark.svg",
    route: "/admin/book-requests",
    text: "Quản lí đơn hàng",
  },
  {
    img: "/icons/admin/user.svg",
    route: "/admin/account-requests",
    text: "Yêu cầu tài khoản",
  },
];

export const FIELD_NAMES = {
  fullName: "Full name",
  email: "Email",
  universityId: "University ID Number",
  password: "Password",
  universityCard: "Upload University ID Card",
};

export const FIELD_TYPES = {
  fullName: "text",
  email: "email",
  universityId: "number",
  password: "password",
};

export const sampleBooks = [
  {
    id: 1,
    title: "Sản khoa Williams",
    author: "F. Gary Cunningham",
    genre: "Sản phụ khoa",
    rating: 4.6,
    total_copies: 20,
    available_copies: 10,
    description:
      "Qua 26 phiên bản, Williams Obstetrics đã hướng đến việc phục vụ các bác sĩ sản khoa và hộ sinh đang hành nghề trong việc chăm sóc bệnh nhân tại giường bệnh. Với các giải thích chi tiết về cơ chế bệnh lý và nguyên tắc điều trị, cuốn sách cung cấp một tài liệu nền tảng cho các bác sĩ nội trú đang đào tạo trong lĩnh vực Sản khoa hoặc các chuyên khoa Y học Gia đình. Các nghiên cứu sinh chuyên ngành Y học Bà mẹ - Thai nhi sẽ được hưởng lợi từ các thảo luận bổ sung về các bệnh lý phức tạp và cách quản lý. Cuối cùng, Williams Obstetrics có thể hỗ trợ các chuyên gia đóng vai trò tư vấn cho phụ nữ mang thai mắc các rối loạn không liên quan đến thai kỳ. Cụ thể, mỗi chương trong Phần 12 tập trung vào một hệ cơ quan cụ thể, các thay đổi sinh lý bình thường và các rối loạn thường gặp của hệ cơ quan đó trong thai kỳ, cùng với các lựa chọn điều trị phù hợp.",
    color: "#2f89d8",
    cover: "https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "A dazzling novel about all the choices that go into a life well lived, The Midnight Library tells the story of Nora Seed as she finds herself between life and death. A dazzling novel about all the choices that go into a life well lived, The Midnight Library tells the story of Nora Seed as she finds herself between life and death.",
  },
  {
    id: 2,
    title: "Current Chẩn đoán và điều trị Nội khoa",
    author: "Maxine A. Papadakis",
    genre: "Nội khoa",
    rating: 4.9,
    total_copies: 99,
    available_copies: 50,
    description:
      "Trong hơn sáu thập kỷ, CMDT đã lan tỏa thông tin uy quyền mà sinh viên, bác sĩ nội trú và các nhà lâm sàng cần để xây dựng kiến thức y khoa, chuyên môn và sự tự tin. Được viết bởi các chuyên gia hàng đầu trong lĩnh vực của họ, các chương được định dạng để bạn có thể tìm thấy các công cụ chẩn đoán phù hợp nhất cho thực hành hàng ngày.",
    color: "#1c58d0",
    cover: "https://m.media-amazon.com/images/I/81-WMfeRkTL._SL1500_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "A revolutionary guide to making good habits, breaking bad ones, and getting 1% better every day.",
  },
  {
    id: 3,
    title: "Sách giáo khoa Phẫu thuật Sabiston",
    author: "Courtney M. Townsend Jr. JR MD",
    genre: "Ngoại khoa",
    rating: 4.7,
    total_copies: 9,
    available_copies: 5,
    description:
      "Trong hơn 80 năm, Sách giáo khoa Phẫu thuật Sabiston: Cơ sở Sinh học của Thực hành Phẫu thuật Hiện đại đã là tài liệu tham khảo hàng đầu cho các bác sĩ thực tập và phẫu thuật viên ở mọi cấp độ kinh nghiệm, cung cấp hướng dẫn chính xác về mọi khía cạnh của phẫu thuật tổng quát. Là sách giáo khoa phẫu thuật được xuất bản liên tục lâu đời nhất ở Bắc Mỹ, Phiên bản thứ 21 được sửa đổi hoàn toàn này tiếp tục cung cấp thông tin cốt lõi, những điểm giảng dạy thiết yếu và nội dung cập nhật toàn diện cần thiết để đưa ra các quyết định phẫu thuật sáng suốt nhất và đạt được kết quả tối ưu cho bệnh nhân. Được viết súc tích và dựa trên bằng chứng, sách bao quát toàn bộ tài liệu cần thiết cho chứng nhận và thực hành phẫu thuật tổng quát, nổi bật với các hình minh họa nội phẫu chi tiết, đầy màu sắc và các đoạn video chất lượng cao.",
    color: "#cb3329",
    cover:
      "https://m.media-amazon.com/images/I/81urGNyaqIL._SL1500_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "An essential guide to understanding the core mechanisms of JavaScript, focusing on scope and closures.",
  },
  {
    id: 4,
    title: "Nội tiết học cơ bản và lâm sàng Greenspan",
    author: "David G. Gardner",
    genre: "Nội tiết",
    rating: 4.5,
    total_copies: 78,
    available_copies: 50,
    description:
      "Nội tiết học Cơ bản & Lâm sàng của Greenspan cung cấp một cái nhìn tổng quan súc tích, tiên tiến về sinh học phân tử của hệ nội tiết và những góc nhìn mới nhất về chẩn đoán và điều trị các bệnh và rối loạn cụ thể. Với thiết kế cải tiến bao gồm hàng trăm hình minh họa đầy màu sắc và ảnh lâm sàng, Greenspan’s là tài liệu không thể thiếu trong các khóa học nội tiết truyền thống hoặc tích hợp, luân khoa nội tiết, hoặc chuẩn bị thi nội khoa và nội tiết, đồng thời là tài liệu tham khảo cho quản lý bệnh. Greenspan’s cung cấp thông tin lâm sàng liên quan về bệnh xương chuyển hóa, hormone tuyến tụy và đái tháo đường, hạ đường huyết, béo phì, nội tiết lão khoa, và nhiều bệnh và rối loạn khác. Hỗ trợ nội dung thiết yếu này là một phụ lục tiện lợi về phạm vi tham chiếu hormone bình thường theo suốt vòng đời.",
    color: "#7f1ef7",
    cover:
      "https://m.media-amazon.com/images/I/71cgSDeQucL._SL1424_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "A magical tale of Santiago, an Andalusian shepherd boy, who embarks on a journey to find a worldly treasure.",
  },
  {
    id: 5,
    title: "Sản khoa Gabbe: Thai kỳ bình thường và bệnh lý",
    author: "Mark B. Landon MD",
    genre: "Sản phụ khoakhoa",
    rating: 4.7,
    total_copies: 23,
    available_copies: 23,
    description:
      "Dễ đọc, minh họa tốt và dễ hiểu, Sản khoa Gabbe: Thai kỳ Bình thường và Có Vấn đề là tài liệu tham khảo hoặc công cụ học tập lý tưởng hàng ngày cho các bác sĩ nội trú và lâm sàng. Phiên bản thứ 8 của cuốn sách bán chạy này cung cấp truy cập nhanh chóng vào thông tin toàn diện, dựa trên bằng chứng, nay được sửa đổi hoàn toàn với các cập nhật nội dung đáng kể, hình minh họa mới và cải tiến, cùng một đội ngũ biên tập quốc tế mới, tiếp tục truyền thống xuất sắc do Tiến sĩ Steven Gabbe thiết lập.",
    color: "#0f0f10",
    cover: "https://m.media-amazon.com/images/I/717MxNRxMKL._SL1500_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "Rules for focused success in a distracted world, teaching how to cultivate deep focus to achieve peak productivity.",
  },
  {
    id: 6,
    title: "Dược lí học cơ bản và lâm sàng Katzung",
    author: "Todd W. Vanderah",
    genre: "Y học cơ sở",
    rating: 4.8,
    total_copies: 56,
    available_copies: 56,
    description:
      "Được trình bày đầy màu sắc và chứa hàng trăm hình minh họa, Dược lý học Cơ bản và Lâm sàng của Katzung là tài liệu hướng dẫn toàn diện, hấp dẫn mà sinh viên đã tin cậy trong nhiều thập kỷ. Để đảm bảo tính liên quan lâm sàng cao nhất, sách bao gồm các phần đặc biệt đề cập đến việc lựa chọn và sử dụng thuốc trên bệnh nhân, theo dõi tác dụng của chúng, cùng với các nghiên cứu trường hợp giới thiệu các vấn đề lâm sàng.",
    color: "#080c0d",
    cover:
      "https://m.media-amazon.com/images/I/71zneQ5gI4L._SL1500_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "A handbook of agile software craftsmanship, offering best practices and principles for writing clean and maintainable code.",
    isLoanedBook: false,
  },
  {
    id: 7,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    genre: "Computer Science / Programming",
    rating: 4.8,
    total_copies: 25,
    available_copies: 3,
    description:
      "A timeless guide for developers to hone their skills and improve their programming practices.",
    color: "#100f15",
    cover:
      "https://m.media-amazon.com/images/I/71VStSjZmpL._AC_UF1000,1000_QL80_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "A timeless guide for developers to hone their skills and improve their programming practices.",
  },
  {
    id: 8,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance / Self-Help",
    rating: 4.8,
    total_copies: 10,
    available_copies: 5,
    description:
      "Morgan Housel explores the unique behaviors and mindsets that shape financial success and decision-making.",
    color: "#ffffff",
    cover:
      "https://m.media-amazon.com/images/I/81Dky+tD+pL._AC_UF1000,1000_QL80_.jpg",
    video: "/sample-video.mp4?updatedAt=1722593504152",
    summary:
      "Morgan Housel explores the unique behaviors and mindsets that shape financial success and decision-making.",
  },
];
