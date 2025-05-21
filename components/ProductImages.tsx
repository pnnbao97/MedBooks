'use client'
import React, { useState } from 'react'
import Image from 'next/image' 
import { Button } from '@/components/ui/button'

const images = [
    {
        id: 1,
        url: "https://m.media-amazon.com/images/I/61cbtQVstYL._SL1424_.jpg"
    },
    {
        id: 2,
        url: "https://m.media-amazon.com/images/I/815o49E2F0L.jpg"
    },
    {
        id: 3,
        url: "https://m.media-amazon.com/images/I/71HuF9ZPeGL.jpg"
    },
    {
        id: 4,
        url: "https://m.media-amazon.com/images/I/81jd-jtbI4L.jpg"
    }
]

// URL của PDF
const pdfUrl = "https://ik.imagekit.io/8vbv6f9t2/Uploads/Williams_s%E1%BA%A3n_preview_recognized__RKmXPD_8.pdf?updatedAt=1747631407829"

const ProductImages = () => {
    const [index, setIndex] = useState(0)
    const [showPDF, setShowPDF] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const handleReadPreview = () => {
        setShowPDF(true)
        setIsLoading(true)
    }

    const closeModal = () => {
        setShowPDF(false)
    }

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    const handleIframeError = () => {
        setIsLoading(false)
        // Có thể xử lý lỗi ở đây nếu cần
    }

    return (
        <div className="flex flex-col">
            <div className="h-96 relative">
                <Image
                    src={images[index].url}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-contain rounded-md"
                />
            </div>
            <div className="flex justify-center mt-4">
                <Button onClick={handleReadPreview} className="bg-white border shadow-md border-gray-800 text-lg hover:bg-blue-950 hover:text-white">
                    Đọc thử
                </Button>
            </div>
            <div className="flex justify-between gap-4 mt-8">
                {images.map((img, i) => (
                    <div 
                        className="w-1/4 h-32 relative cursor-pointer" 
                        key={img.id}
                        onClick={() => setIndex(i)}
                    >
                        <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="30vw"
                            className="object-contain rounded-md"
                        />
                    </div>
                ))}
            </div>

            {/* Modal hiển thị PDF bằng iframe */}
            {showPDF && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 max-w-4xl w-full h-5/6 max-h-screen relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded z-10"
                        >
                            Đóng
                        </button>
                        
                        {isLoading && (
                            <div className="flex justify-center items-center h-64 absolute top-0 left-0 right-0 z-0">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-2">Đang tải PDF...</p>
                                </div>
                            </div>
                        )}
                        
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full rounded-md"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            style={{ display: 'block' }}
                            title="PDF Preview"
                            allow="fullscreen"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductImages