'use server'

import { db } from '@/database/drizzle'
import { books } from '@/database/schema'
import { desc, eq, or, and, gte, lte, like, asc, sql } from 'drizzle-orm'


interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  availability?: string; // 'in-stock', 'preorder', 'all'
  sort?: string; // 'newest', 'oldest', 'price-low', 'price-high', 'title-az', 'title-za'
  search?: string;
  limit?: number;
}

// Helper function to build price condition
function buildPriceCondition(minPrice?: number, maxPrice?: number) {
  const priceConditions = [];
  
  if (minPrice !== undefined) {
    priceConditions.push(
      sql`CASE 
        WHEN ${books.hasColorSale} = true 
        THEN ${books.colorPrice} - ${books.colorSaleAmount} >= ${minPrice}
        ELSE ${books.colorPrice} >= ${minPrice}
      END`
    );
  }
  
  if (maxPrice !== undefined) {
    priceConditions.push(
      sql`CASE 
        WHEN ${books.hasColorSale} = true 
        THEN ${books.colorPrice} - ${books.colorSaleAmount} <= ${maxPrice}
        ELSE ${books.colorPrice} <= ${maxPrice}
      END`
    );
  }
  
  return priceConditions.length > 0 ? and(...priceConditions) : undefined;
}

// Helper function to build order by clause
function buildOrderBy(sort: string = 'newest') {
  switch (sort) {
    case 'oldest':
      return asc(books.createdAt);
    case 'price-low':
      return sql`CASE 
        WHEN ${books.hasColorSale} = true 
        THEN ${books.colorPrice} - ${books.colorSaleAmount}
        ELSE ${books.colorPrice}
      END ASC`;
    case 'price-high':
      return sql`CASE 
        WHEN ${books.hasColorSale} = true 
        THEN ${books.colorPrice} - ${books.colorSaleAmount}
        ELSE ${books.colorPrice}
      END DESC`;
    case 'title-az':
      return asc(books.title);
    case 'title-za':
      return desc(books.title);
    default: // 'newest'
      return desc(books.createdAt);
  }
}

// Server action để lấy danh sách sách với filter
export async function getBooks(options: FilterOptions = {}): Promise<Book[]> {
  try {
    const {
      minPrice,
      maxPrice,
      availability = 'all',
      sort = 'newest',
      search,
      limit = 50
    } = options;

    // Build where conditions
    const conditions = [];

    // Base condition: only show visible books
    if (availability === 'in-stock') {
      // Only completed books with available copies
      conditions.push(
        and(
          eq(books.isCompleted, true),
          gte(books.availableCopies, 1)
        )
      );
    } else if (availability === 'preorder') {
      // Only preorder books
      conditions.push(eq(books.preorder, true));
    } else {
      // All books: completed books OR preorder books
      conditions.push(
        or(
          and(eq(books.isCompleted, true), gte(books.availableCopies, 0)),
          eq(books.preorder, true)
        )
      );
    }

    // Price filter
    const priceCondition = buildPriceCondition(minPrice, maxPrice);
    if (priceCondition) {
      conditions.push(priceCondition);
    }

    // Search filter
    if (search && search.trim()) {
      conditions.push(
        or(
          like(books.title, `%${search.trim()}%`),
          like(books.author, `%${search.trim()}%`),
          like(books.description, `%${search.trim()}%`)
        )
      );
    }

    const query = db
      .select({
        id: books.id,
        slug: books.slug,
        title: books.title,
        author: books.author,
        primarySpecialty: books.primarySpecialty,
        detail: books.detail,
        description: books.description,
        previewImages: books.previewImages,
        colorPrice: books.colorPrice,
        photoPrice: books.photoPrice,
        hasColorSale: books.hasColorSale,
        colorSaleAmount: books.colorSaleAmount,
        availableCopies: books.availableCopies,
        preorder: books.preorder,
        isCompleted: books.isCompleted,
        createdAt: books.createdAt,
        // Thêm các fields còn thiếu
        isbn: books.isbn,
        relatedSpecialties: books.relatedSpecialties,
        relatedBooks: books.relatedBooks,
        content: books.content,
        pdfUrl: books.pdfUrl,
        coverColor: books.coverColor,
        predictDate: books.predictDate,
      })
      .from(books)
      .orderBy(buildOrderBy(sort))
      .limit(limit);

    // Chỉ thêm where clause nếu có conditions
    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    // Process results
    return result.map(book => ({
      ...book,
      coverUrl: book.previewImages && book.previewImages.length > 0 
        ? book.previewImages[0] 
        : '',
    }));
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Server action để lấy sách theo specialty với filter
export async function getBooksBySpecialty(
  specialty: string, 
  options: FilterOptions = {}
): Promise<Book[]> {
  try {
    const {
      minPrice,
      maxPrice,
      availability = 'all',
      sort = 'newest',
      search,
      limit = 50
    } = options;

    // Build where conditions
    const conditions = [eq(books.primarySpecialty, specialty)];

    // Availability filter
    if (availability === 'in-stock') {
      conditions.push(
        and(
          eq(books.isCompleted, true),
          gte(books.availableCopies, 1)
        )
      );
    } else if (availability === 'preorder') {
      conditions.push(eq(books.preorder, true));
    } else {
      // Show both completed and preorder books
      conditions.push(
        or(
          and(eq(books.isCompleted, true), gte(books.availableCopies, 0)),
          eq(books.preorder, true)
        )
      );
    }

    // Price filter
    const priceCondition = buildPriceCondition(minPrice, maxPrice);
    if (priceCondition) {
      conditions.push(priceCondition);
    }

    // Search filter
    if (search && search.trim()) {
      conditions.push(
        or(
          like(books.title, `%${search.trim()}%`),
          like(books.author, `%${search.trim()}%`),
          like(books.description, `%${search.trim()}%`)
        )
      );
    }

    const result = await db
      .select({
        id: books.id,
        slug: books.slug,
        title: books.title,
        author: books.author,
        primarySpecialty: books.primarySpecialty,
        detail: books.detail,
        description: books.description,
        previewImages: books.previewImages,
        colorPrice: books.colorPrice,
        photoPrice: books.photoPrice,
        hasColorSale: books.hasColorSale,
        colorSaleAmount: books.colorSaleAmount,
        availableCopies: books.availableCopies,
        preorder: books.preorder,
        isCompleted: books.isCompleted,
        createdAt: books.createdAt,
        // Thêm các fields còn thiếu
        isbn: books.isbn,
        relatedSpecialties: books.relatedSpecialties,
        relatedBooks: books.relatedBooks,
        content: books.content,
        pdfUrl: books.pdfUrl,
        coverColor: books.coverColor,
        predictDate: books.predictDate,
      })
      .from(books)
      .where(and(...conditions))
      .orderBy(buildOrderBy(sort))
      .limit(limit);

    return result.map(book => ({
      ...book,
      coverUrl: book.previewImages && book.previewImages.length > 0 
        ? book.previewImages[0] 
        : '',
      previewImages: book.previewImages || [],
      relatedSpecialties: book.relatedSpecialties || [],
      relatedBooks: book.relatedBooks || [],
    }));
  } catch (error) {
    console.error('Error fetching books by specialty:', error);
    return [];
  }
}

// Server action để lấy sách theo slug
export async function getBookBySlug(slug: string): Promise<{ success: boolean; data?: Book; message?: string }> {
  try {
    const result = await db
      .select({
        id: books.id,
        title: books.title,
        slug: books.slug,
        author: books.author,
        primarySpecialty: books.primarySpecialty,
        detail: books.detail,
        description: books.description,
        previewImages: books.previewImages,
        colorPrice: books.colorPrice,
        photoPrice: books.photoPrice,
        hasColorSale: books.hasColorSale,
        colorSaleAmount: books.colorSaleAmount,
        availableCopies: books.availableCopies,
        preorder: books.preorder,
        isCompleted: books.isCompleted,
        createdAt: books.createdAt,
        pdfUrl: books.pdfUrl,
        isbn: books.isbn,
        relatedSpecialties: books.relatedSpecialties,
        relatedBooks: books.relatedBooks,
        content: books.content,
        coverColor: books.coverColor,
        predictDate: books.predictDate,
      })
      .from(books)
      .where(eq(books.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return { success: false, message: 'Không tìm thấy sách' };
    }

    const book = result[0];
    return {
      success: true,
      data: {
        ...book,
        coverUrl: book.previewImages && book.previewImages.length > 0 
          ? book.previewImages[0] 
          : '',
      },
    };
  } catch (error) {
    console.error('Error fetching book by slug:', error);
    return { success: false, message: 'Lỗi khi lấy dữ liệu sách' };
  }
}

// Helper function để lấy các specialty có sách
export async function getAvailableSpecialties(): Promise<{ value: string; label: string; count: number }[]> {
  try {
    const result = await db
      .select({
        specialty: books.primarySpecialty,
        count: sql<number>`count(*)::int`
      })
      .from(books)
      .where(
        or(
          and(eq(books.isCompleted, true), gte(books.availableCopies, 0)),
          eq(books.preorder, true)
        )
      )
      .groupBy(books.primarySpecialty)
      .orderBy(desc(sql`count(*)`));

    const medicalSpecialties = [
      { value: "noi-khoa", label: "Nội khoa" },
      { value: "ngoai-khoa", label: "Ngoại khoa" },
      { value: "san-phu-khoa", label: "Sản phụ khoa" },
      { value: "nhi-khoa", label: "Nhi khoa" },
      { value: "nhan-khoa", label: "Nhãn khoa" },
      { value: "tai-mui-hong", label: "Tai mũi họng" },
      { value: "da-lieu", label: "Da liễu" },
      { value: "tinh-than", label: "Tâm thần" },
      { value: "than-kinh", label: "Thần kinh" },
      { value: "tim-mach", label: "Tim mạch" },
      { value: "ho-hap", label: "Hô hấp" },
      { value: "tieu-hoa", label: "Tiêu hóa" },
      { value: "noi-tiet", label: "Nội tiết" },
      { value: "than-tiet-nieu", label: "Thận - Tiết niệu" },
      { value: "co-xuong-khop", label: "Cơ xương khớp" },
      { value: "ung-buou", label: "Ung bướu" },
      { value: "gay-me-hoi-suc", label: "Gây mê hồi sức" },
      { value: "cap-cuu", label: "Cấp cứu" },
      { value: "truyen-nhiem", label: "Truyền nhiễm" },
      { value: "cdha", label: "Chẩn đoán hình ảnh" },
      { value: "huyet-hoc", label: "Huyết học" },
      { value: "co-so", label: "Y học cơ sở" },
      { value: "y-hoc-gia-dinh", label: "Y học gia đình" }
    ];

    return result.map(item => {
      const specialty = medicalSpecialties.find(s => s.value === item.specialty);
      return {
        value: item.specialty,
        label: specialty?.label || item.specialty,
        count: item.count
      };
    });
  } catch (error) {
    console.error('Error fetching available specialties:', error);
    return [];
  }
}