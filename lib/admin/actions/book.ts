'use server'

import { db } from '@/database/drizzle';
import { books } from '@/database/schema'
import { eq } from 'drizzle-orm';

export const createBook = async (params: BookParams) => {
    try {
        const newBook = await db.insert(books).values({
            ...params
        })
        .returning();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(newBook[0]))
        }

    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: 'Lỗi xảy ra khi thêm sách mới'
        }
    }
}

export const getBookById = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID sách không hợp lệ');
    }

    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book.length) {
      return {
        success: false,
        message: 'Không tìm thấy sách với ID này',
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(book[0])), // Serialize to remove non-serializable properties
    };
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    return {
      success: false,
      message: 'Lỗi xảy ra khi lấy thông tin sách',
    };
  }
};