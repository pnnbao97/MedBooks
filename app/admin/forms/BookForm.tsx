'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { Input } from '@/components/ui/input'

import { bookSchema } from '@/lib/validations'
import { FIELD_NAMES } from '@/constants'
import { Textarea } from '@/components/ui/textarea'
import { MySqlColumnBuilderWithAutoIncrement } from 'drizzle-orm/mysql-core'
import { Button } from '@/components/ui/button'
import FileUpload from '@/components/FileUpload'

interface Props extends Partial<Book> {
    type: 'create' | 'update'
}

const BookForm = ({ type, 
                    ...book
 }: Props) => {

  
  const form = useForm<z.infer<typeof bookSchema>> ({
    resolver: zodResolver(bookSchema),
    defaultValues: {
        title: '',
        author: '',
        genre: '',
        rating: 1,
        progress: 0,
        preorder: false,
        price: 0,
        totalCopies: 0,
        isbn: '',
        description: '',
        coverUrl: '',
        coverColor: '',
        pdfUrl: '',
        content: '',
    }
  })
 
  const onSubmit = async (values: z.infer<typeof bookSchema>) => {};
  return (
   
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name={"title"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Tên sách
                    </FormLabel>
                    <FormControl>
                        <Input
                            required
                            placeholder='Tên sách'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
            control={form.control}
            name={"author"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Tác giả
                    </FormLabel>
                    <FormControl>
                        <Input
                            required
                            placeholder='Tác giả'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
            control={form.control}
            name={"genre"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Chuyên ngành
                    </FormLabel>
                    <FormControl>
                        <Input
                            required
                            placeholder='Chuyên ngành'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
            control={form.control}
            name={"rating"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Đánh giá
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder='Đánh giá'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
        <FormField
            control={form.control}
            name={"totalCopies"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Số lượng sách có sẵn
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            min={0}
                            max={1000}
                            placeholder='Số lượng'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
            control={form.control}
            name={"totalCopies"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Tiến độ
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder='Tiến độ'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              /><FormField
            control={form.control}
            name={"totalCopies"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Giá bán
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            placeholder='Giá bán'
                            className='book-form-input'
                        />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
        <FormField
            control={form.control}
            name={"coverUrl"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Tải lên bìa sách
                    </FormLabel>
                    <FormControl>
                       <FileUpload/>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
        <FormField
            control={form.control}
            name={"coverColor"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Chọn màu cho bìa
                    </FormLabel>
                    <FormControl>
                        {/* File Upload */}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
        <FormField
            control={form.control}
            name={"description"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Mô tả
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder='mô tả sách, ngắn gọn, dưới 1000 từ, cân nhắc dùng Grok'
                            {... field}
                            rows={10}
                            className='book-form_input'
                        />

                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
            control={form.control}
            name={"pdfUrl"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        File PDF xem trước
                    </FormLabel>
                    <FormControl>

                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
            control={form.control}
            name={"content"}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                        Mục lục sách
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder='xúc tích nhưng đầy đủ, cho người xem nắm được sơ bộ về nội dung cuốn sách'
                            {... field}
                            rows={10}
                            className='book-form_input'
                        />

                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
        <Button type="submit" className='book-form_btn text-lime-50'>
            Đăng sách lên
        </Button>
      </form>
    </Form>
   
  )
}
export default BookForm