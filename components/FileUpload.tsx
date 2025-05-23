"use client";

import React, { useRef, useState } from "react";
import {
  Image,
  ImageKitProvider,
  upload,
} from "@imagekit/next";
import config from "@/lib/config";
import { Button } from "./ui/button";

interface FileUploadProps {
  accept: "image" | "image-preview" | "pdf";
  onChange?: (url: string) => void; // Thêm prop onChange
}

const FileUpload = ({ accept, onChange }: FileUploadProps) => {
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = new AbortController();

  const authenticator = async () => {
    try {
      // const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
      const response = await fetch("/api/auth/imagekit", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error: any) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Chọn file để tải lên");
      return;
    }

    const file = fileInput.files[0];
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (accept === "image" || accept === "image-preview") {
      if (!isImage) {
        alert("Chỉ upload file ảnh");
        return;
      }
    }
    if (accept === "pdf") {
      if (!isPDF) {
        alert("Chỉ upload file pdf");
        return;
      }
    }

    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      alert("Authentication failed");
      return;
    }

    const { signature, expire, token, publicKey } = authParams;

    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        folder: "/Uploads",
        useUniqueFileName: true,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });

      if (!uploadResponse.url) {
        throw new Error("Upload response does not contain a valid URL");
      }

      setUploadedFileUrl(uploadResponse.url);
      setFileType(isImage ? "image" : "pdf");
      onChange?.(uploadResponse.url); // Gọi onChange để truyền URL ra ngoài
    } catch (error: any) {
      alert("Upload failed: " + (error.message || "Unknown error"));
    }
  };

  const handleCancel = () => {
    abortController.abort();
    setProgress(0);
  };

  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
        />
        <div className="flex flex-wrap gap-4 mt-2">
        <Button className='bg-blue-900 text-white hover:bg-white hover:text-blue-900' onClick={(e) => { e.preventDefault(); handleUpload(); }}>

          Tải file
        </Button>

        </div>
        <br />
        {/* <p>Tiến độ: <progress value={progress} max={100} /></p> */}
        {progress >0 && progress !== 100 && (
          <div className="w-full rounded-full bg-green-200">
            <div className="progress" style={{ width: `${progress}%`}}></div>
          </div>
        )}
        {uploadedFileUrl && accept === "image" && (
          <div>
            <h3>Bìa sách xem trước:</h3>
            <Image
              src={uploadedFileUrl}
              width={700}
              height={900}
              alt="Uploaded image"
              transformation={[{ width: 700, height: 900 }]}
            />
          </div>
        )}
        {uploadedFileUrl && fileType === "pdf" && (
          <div>
            <h3>Xem trước file PDF tải lên:</h3>
            <iframe
      src={uploadedFileUrl}
      width="100%"
      height="600px"
      title="PDF Viewer"
    />
          </div>
        )}
      </div>
    </ImageKitProvider>
  );
};

export default FileUpload;