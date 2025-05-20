"use client";

import React, { useRef, useState } from "react";
import {
  Image,
  ImageKitProvider,
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError,
} from "@imagekit/next";
import config from "@/lib/config";
import { Button } from "./ui/button";

const FileUpload = () => {
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
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      alert("Please upload an image or PDF file");
      return;
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
      console.log("Upload successful:", uploadResponse);
    } catch (error: any) {
      console.error("Upload error:", error);
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
        <div className="flex flex-wrap gap-4">
        <Button onClick={handleUpload}>
          Tải file
        </Button>
        
        <Button type="button" onClick={handleCancel} disabled={progress === 0}>
          Hủy bỏ
        </Button>
        </div>
        <br />
        <p>Tiến độ: <progress value={progress} max={100} /></p>

        {uploadedFileUrl && fileType === "image" && (
          <div>
            <h3>Uploaded Image:</h3>
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