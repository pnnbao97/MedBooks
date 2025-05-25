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
        title: books.title,
        author: books.author,
        primarySpecialty: books.primarySpecialty,
        detail: books.detail,
        description: books.description,
        previewImages: books.previewImages, // Lấy mảng previewImages thay vì coverUrl
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
      .limit(20); // Giới hạn 20 sách mới nhất

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