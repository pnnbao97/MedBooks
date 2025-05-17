'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultValues, FieldValues, SubmitHandler, useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

interface Props<T extends FieldValues> {
    type: "SIGN_IN" | "SIGN_UP"
    schema: z.ZodType<T>
    defaultValues: DefaultValues<T>
    onSubmit: (data: T) => Promise<{success: boolean, error?: string}>
}

const AuthForm = ({ type, schema, defaultValues, onSubmit }: Props<any>) => {

  const router = useRouter();
  const isSignIn = type === "SIGN_IN"
  const form: UseFormReturn<any> = useForm( {
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<any>,
  })
 
  
  const handleSubmit: SubmitHandler<any> = async (data) => {
    const result = await onSubmit(data);
    if (result.success) {
      toast(
        <>
          <div className="font-semibold">Thành công</div>
          <div>{isSignIn ? "Đăng nhập thành công" : "Đăng ký thành công"}</div>
        </>
      );

      router.push("/");
    }
    else {
      toast(
        `Lỗi ${isSignIn ? "đăng nhập" : "đăng ký"}: 
        ${result.error ?? "Đã xảy ra lỗi."}`
      )
    }
  };
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-semibold text-light-700'>
        {isSignIn ? "Đăng nhập" : "Đăng ký"}
      </h1>
      <p>
        {isSignIn
          ? "Cùng chúng tôi tiếp cận nguồn tri thức y khoa nhân loại."
          : "Chào mừng bạn đến với MedBooks! Đăng ký để bắt đầu."}
      </p>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6
        w-full">
          {Object.keys(defaultValues).map((key) => {

            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='capitalize'>{key}</FormLabel>
                    <FormControl>
                      {field.name === "password" ? (
                        <Input type="password" placeholder={key} {...field} className='form-input'/>
                      ) : (
                        <Input type="text" placeholder={key} {...field} className='form-input' />
                      )}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          })}

        <Button className="form-btn" type="submit">{isSignIn ? 'Đăng nhập': 'Đăng ký'}</Button>
      </form>
    </Form>
    <p className='text-center text-base font-medium'>
      {isSignIn
        ? "Chưa có tài khoản? "
        : "Đã có tài khoản? "}
      <Link href={isSignIn ? "/register" : "/login"} className='text-light-700 hover:text-light-800'>
        {isSignIn ? "Đăng ký" : "Đăng nhập"} </Link>
    </p>
    </div>
  )
}
export default AuthForm