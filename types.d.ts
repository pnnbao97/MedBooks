interface Book {
  title: string;
  author: string;
  primarySpecialty: string;
  relatedSpecialties: string[];
  detail: string;
  predictDate?: string;
  preorder: boolean;
  availableCopies: number;
  isbn?: string;
  description?: string;
  coverUrl: string;
  coverColor: string;
  pdfUrl: string;
  content: string;
  isCompleted: boolean;
  colorPrice: number;
  photoPrice: number;
  hasColorSale: boolean;
  colorSaleAmount: number;
}

interface AuthCredentials {
    fullName: string;
    email: string;
    password: string;
}

interface BookParams {
    // Thông tin cơ bản
    title: string;
    author: string;
    genre: string;
    description: string;
    content: string; // Mục lục sách
    
    // Thông tin số lượng và ISBN
    availableCopies: number;
    isbn?: string; // Optional vì có thể không bắt buộc
    
    // Thông tin file và hình ảnh
    coverUrl: string;
    coverColor: string;
    pdfUrl: string;
    
    // Trạng thái sách
    isCompleted: boolean; // Sách đã hoàn thành chưa
    
    // Thông tin đặt trước (chỉ áp dụng khi sách chưa hoàn thành)
    preorder?: boolean; // Optional vì chỉ có khi isCompleted = false
    predictDate?: string; // Optional, ngày dự kiến ra mắt
    
    // Thông tin giá (chỉ có khi sách hoàn thành hoặc cho phép đặt trước)
    price?: number; // Giá gốc (nếu cần)
    colorPrice?: number; // Giá bản màu
    photoPrice?: number; // Giá bản photo
    
    // Thông tin sale cho bản màu
    hasColorSale?: boolean; // Có sale cho bản màu không
    colorSaleAmount?: number; // Số tiền giảm giá
}