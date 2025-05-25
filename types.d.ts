
// Define the Book type based on the schema
interface Book {
  createdAt: string;
  id: number;
  slug: string;
  title: string;
  author: string;
  primarySpecialty: string;
  relatedSpecialties: string[];
  relatedBooks: string[];
  detail: string;
  description: string;
  content: string;
  availableCopies: number;
  isbn: string | null;
  coverUrl: string;
  coverColor: string;
  pdfUrl: string;
  previewImages: string[];
  isCompleted: boolean;
  preorder: boolean;
  predictDate: string | null;
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
    slug: string;
    primarySpecialty: string; // Thay đổi từ genre thành primarySpecialty
    relatedSpecialties: string[]; // Mới: Chuyên ngành liên quan
    relatedBooks: string[]; // Mới: Sách liên quan
    detail: string; // Thay đổi từ description thành detail
    content: string; // Mục lục sách
    description?: string; // Mô tả (optional, max 100 ký tự)
    
    // Thông tin số lượng và ISBN
    availableCopies: number;
    isbn?: string; // Optional
    
    // Thông tin file và hình ảnh
    coverUrl: string;
    coverColor: string;
    pdfUrl: string;
    previewImages: string[]; // Mới: Tối đa 6 trang xem trước
    
    // Trạng thái sách
    isCompleted: boolean; // Sách đã hoàn thành chưa
    
    // Thông tin đặt trước
    preorder: boolean; // Không còn optional, có default false
    predictDate?: string; // Ngày dự kiến ra mắt (bắt buộc khi isCompleted = false)
    
    // Thông tin giá
    colorPrice: number; // Giá bản màu (không còn optional, có default 0)
    photoPrice: number; // Giá bản photo (không còn optional, có default 0)
    
    // Thông tin sale cho bản màu
    hasColorSale: boolean; // Có sale cho bản màu không (không còn optional)
    colorSaleAmount: number; // Số tiền giảm giá (không còn optional, có default 0)
}

// Type để tạo sách mới (với các giá trị default)
interface CreateBookParams {
    // Bắt buộc
    title: string;
    author: string;
    primarySpecialty: string;
    detail: string;
    
    // Optional với default values
    relatedSpecialties?: string[];
    relatedBooks?: string[];
    description?: string;
    predictDate?: string;
    preorder?: boolean;
    availableCopies?: number;
    isbn?: string;
    coverUrl?: string;
    coverColor?: string;
    pdfUrl?: string;
    content?: string;
    isCompleted?: boolean;
    colorPrice?: number;
    photoPrice?: number;
    hasColorSale?: boolean;
    colorSaleAmount?: number;
    previewImages?: string[];
}

// Type để cập nhật sách (tất cả đều optional)
interface UpdateBookParams {
    title?: string;
    author?: string;
    primarySpecialty?: string;
    relatedSpecialties?: string[];
    relatedBooks?: string[];
    detail?: string;
    description?: string;
    predictDate?: string;
    preorder?: boolean;
    availableCopies?: number;
    isbn?: string;
    coverUrl?: string;
    coverColor?: string;
    pdfUrl?: string;
    content?: string;
    isCompleted?: boolean;
    colorPrice?: number;
    photoPrice?: number;
    hasColorSale?: boolean;
    colorSaleAmount?: number;
    previewImages?: string[];
}