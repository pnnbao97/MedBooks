'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { bookSchema } from '@/lib/validations'
import { FIELD_NAMES } from '@/constants'
import { Textarea } from '@/components/ui/textarea'
import FileUpload from '@/components/FileUpload'
import ColorPicker from '../ColorPicker'

// Danh sách chuyên ngành y khoa
const medicalSpecialties = [
  { value: "noi-khoa", label: "Nội khoa" },
  { value: "ngoai-khoa", label: "Ngoại khoa" },
  { value: "san-phu-khoa", label: "Sản phụ khoa" },
  { value: "nhi-khoa", label: "Nhi khoa" },
  { value: "nhan-khoa", label: "Nhãn khoa" },
  { value: "tai-mui-hong", label: "Tai mũi họng" },
  { value: "rang-ham-mat", label: "Răng hàm mặt" },
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
]

interface Props extends Partial<Book> {
    type: 'create' | 'update'
}

const BookForm = ({ type, ...book }: Props) => {
  const [primarySpecialtyOpen, setPrimarySpecialtyOpen] = React.useState(false)
  const [relatedSpecialtiesOpen, setRelatedSpecialtiesOpen] = React.useState(false)

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
        title: '',
        author: '',
        primarySpecialty: '', // Chuyên ngành chính
        relatedSpecialties: [], // Chuyên ngành liên quan
        detail: '', // Chi tiết
        predictDate: '',
        preorder: false,
        availableCopies: 0,
        isbn: '',
        description: '',
        coverUrl: '',
        coverColor: '',
        pdfUrl: '',
        content: '',
        isCompleted: true,
        colorPrice: 0,
        photoPrice: 0,
        hasColorSale: false,
        colorSaleAmount: 0,
    }
  })

  // Watch để theo dõi giá trị của checkbox
  const isCompleted = form.watch("isCompleted")
  const preorder = form.watch("preorder")
  const hasColorSale = form.watch("hasColorSale")
  const selectedRelatedSpecialties = form.watch("relatedSpecialties")

  // Logic hiển thị các trường giá: chỉ hiển thị khi sách đã hoàn thành HOẶC cho phép đặt trước
  const shouldShowPricing = isCompleted || preorder

  const onSubmit = async (values: z.infer<typeof bookSchema>) => {
    console.log(values)
    
  }

  // Hàm xóa chuyên ngành liên quan
  const removeRelatedSpecialty = (specialtyToRemove: string) => {
    const currentSpecialties = form.getValues("relatedSpecialties")
    const updatedSpecialties = currentSpecialties.filter(specialty => specialty !== specialtyToRemove)
    form.setValue("relatedSpecialties", updatedSpecialties)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Tên sách
              </FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder='Tên sách'
                  {...field}
                  className='book-form_input'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Tác giả
              </FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder='Tác giả'
                  {...field}
                  className='book-form_input'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chuyên ngành chính */}
        <FormField
          control={form.control}
          name="primarySpecialty"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Chuyên ngành chính
              </FormLabel>
              <FormControl>
                <Popover open={primarySpecialtyOpen} onOpenChange={setPrimarySpecialtyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={primarySpecialtyOpen}
                      className="w-full justify-between book-form_input"
                    >
                      {field.value
                        ? medicalSpecialties.find((specialty) => specialty.value === field.value)?.label
                        : "Chọn chuyên ngành chính..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Tìm chuyên ngành..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy chuyên ngành.</CommandEmpty>
                        <CommandGroup>
                          {medicalSpecialties.map((specialty) => (
                            <CommandItem
                              key={specialty.value}
                              value={specialty.value}
                              onSelect={(currentValue) => {
                                field.onChange(currentValue === field.value ? "" : currentValue)
                                setPrimarySpecialtyOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === specialty.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {specialty.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chuyên ngành liên quan */}
        <FormField
          control={form.control}
          name="relatedSpecialties"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Chuyên ngành liên quan
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Popover open={relatedSpecialtiesOpen} onOpenChange={setRelatedSpecialtiesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={relatedSpecialtiesOpen}
                        className="w-full justify-between book-form_input"
                      >
                        Thêm chuyên ngành liên quan...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Tìm chuyên ngành..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy chuyên ngành.</CommandEmpty>
                          <CommandGroup>
                            {medicalSpecialties
                              .filter(specialty => !field.value.includes(specialty.value))
                              .map((specialty) => (
                                <CommandItem
                                  key={specialty.value}
                                  value={specialty.value}
                                  onSelect={(currentValue) => {
                                    const updatedSpecialties = [...field.value, currentValue]
                                    field.onChange(updatedSpecialties)
                                    setRelatedSpecialtiesOpen(false)
                                  }}
                                >
                                  {specialty.label}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Hiển thị các chuyên ngành đã chọn */}
                  {selectedRelatedSpecialties && selectedRelatedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRelatedSpecialties.map((specialtyValue) => {
                        const specialty = medicalSpecialties.find(s => s.value === specialtyValue)
                        return specialty ? (
                          <div
                            key={specialtyValue}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {specialty.label}
                            <button
                              type="button"
                              onClick={() => removeRelatedSpecialty(specialtyValue)}
                              className="ml-1 hover:bg-red-200 rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chi tiết */}
        <FormField
          control={form.control}
          name="detail"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Chi tiết
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Thông tin chi tiết về sách'
                  {...field}
                  rows={4}
                  className='book-form_input'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availableCopies"
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
                  {...field}
                  className='book-form_input'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkbox kiểm tra sách đã hoàn thành chưa */}
        <FormField
          control={form.control}
          name="isCompleted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className='border-2 border-red-950 data-[state=checked]:bg-red-800 data-[state=checked]:border-red-500 data-[state=checked]:text-white'
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className='text-base font-normal text-dark-500'>
                  Sách đã hoàn thành
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chỉ hiển thị preorder và predictDate nếu sách chưa hoàn thành */}
        {!isCompleted && (
          <>
            <FormField
              control={form.control}
              name="preorder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='border-2 border-red-950 data-[state=checked]:bg-red-800 data-[state=checked]:border-red-500 data-[state=checked]:text-white'          
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className='text-base font-normal text-dark-500'>
                      Cho phép đặt trước
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="predictDate"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel className='text-base font-normal text-dark-500'>
                    Ngày dự kiến ra mắt
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal book-form_input",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Chỉ hiển thị các trường giá khi sách đã hoàn thành HOẶC cho phép đặt trước */}
        {shouldShowPricing && (
          <>
            {/* Giá bản màu */}
            <FormField
              control={form.control}
              name="colorPrice"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel className='text-base font-normal text-dark-500'>
                    Giá bản màu
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder='Giá bản màu'
                      {...field}
                      className='book-form_input'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox có sale cho bản màu không */}
            <FormField
              control={form.control}
              name="hasColorSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='border-2 border-red-950 data-[state=checked]:bg-red-800 data-[state=checked]:border-red-500 data-[state=checked]:text-white' 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className='text-base font-normal text-dark-500'>
                      Bản màu có sale
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chỉ hiển thị số tiền sale nếu có sale */}
            {hasColorSale && (
              <FormField
                control={form.control}
                name="colorSaleAmount"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className='text-base font-normal text-dark-500'>
                      Số tiền giảm giá (VND)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder='Số tiền giảm giá'
                        {...field}
                        className='book-form_input'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Giá bản photo */}
            <FormField
              control={form.control}
              name="photoPrice"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel className='text-base font-normal text-dark-500'>
                    Giá bản photo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder='Giá bản photo'
                      {...field}
                      className='book-form_input'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Tải lên bìa sách
              </FormLabel>
              <FormControl>
                <FileUpload
                  accept="image"
                  onChange={(url) => form.setValue("coverUrl", url)} // Cập nhật coverUrl
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverColor"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Chọn màu cho bìa
              </FormLabel>
              <FormControl>
                <ColorPicker
                  onPickerChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Mô tả
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='mô tả sách, ngắn gọn, dưới 1000 từ, cân nhắc dùng Grok'
                  {...field}
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
          name="pdfUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                File PDF xem trước
              </FormLabel>
              <FormControl>
                <FileUpload
                  accept="pdf"
                  onChange={(url) => form.setValue("pdfUrl", url)} // Cập nhật pdfUrl
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className='text-base font-normal text-dark-500'>
                Mục lục sách
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='xúc tích nhưng đầy đủ, cho người xem nắm được sơ bộ về nội dung cuốn sách'
                  {...field}
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