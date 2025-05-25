'use server'

import { db } from '@/database/drizzle'
import { books } from '@/database/schema'
import { desc, eq, or } from 'drizzle-orm'


// Server action để lấy danh sách sách
export async function getBooks(): Promise<Book[]> {
  try {
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
      })
      .from(books)
      .where(or(
        eq(books.isCompleted, true), // Sách đã hoàn thành
        eq(books.preorder, true)     // Sách cho phép preorder
      ))
      .orderBy(desc(books.createdAt))
      .limit(6); 

    // Xử lý để lấy phần tử đầu tiên của previewImages làm coverUrl
    return result.map(book => ({
      ...book,
      coverUrl: book.previewImages && book.previewImages.length > 0 
        ? book.previewImages[0] 
        : '', // Nếu không có previewImages thì để trống
      previewImages: undefined // Loại bỏ previewImages khỏi kết quả trả về
    }));
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Server action để lấy sách theo category
export async function getBooksByCategory(category: string): Promise<Book[]> {
  try {
    const result = await db
      .select({
        id: books.id,
        slug: books.slug,
        title: books.title,
        author: books.author,
        primarySpecialty: books.primarySpecialty,
        detail: books.detail,
        description: books.description,
        coverUrl: books.coverUrl,
        colorPrice: books.colorPrice,
        photoPrice: books.photoPrice,
        hasColorSale: books.hasColorSale,
        colorSaleAmount: books.colorSaleAmount,
        availableCopies: books.availableCopies,
        preorder: books.preorder,
        isCompleted: books.isCompleted,
      })
      .from(books)
    //   .where(eq(books.isCompleted, true))
      .where(eq(books.primarySpecialty, category))
      .orderBy(desc(books.createdAt))
      .limit(20);

    return result;
  } catch (error) {
    console.error('Error fetching books by category:', error);
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
        coverUrl: books.coverUrl,
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
          : '', // Nếu không có previewImages thì để trống
        previewImages: book.previewImages || [],
        relatedSpecialties: book.relatedSpecialties || [],
        relatedBooks: book.relatedBooks || [],
      },
    };
  } catch (error) {
    console.error('Error fetching book by slug:', error);
    return { success: false, message: 'Lỗi khi lấy dữ liệu sách' };
  }
}