"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, Check, AlertCircle, FileJson } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>
  acceptedFileTypes?: string
  maxSizeMB?: number
  label?: string
  description?: string
  isLoading?: boolean
}

export default function FileUpload({
  onFileUpload,
  acceptedFileTypes = ".json",
  maxSizeMB = 5,
  label = "Upload File",
  description = "Drag and drop your file here, or click to browse",
  isLoading = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (acceptedFileTypes && !file.name.endsWith(".json")) {
      setError(`Invalid file type. Please upload a JSON file.`)
      return false
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`)
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(false)

    if (!validateFile(file)) {
      return
    }

    setFile(file)

    try {
      await onFileUpload(file)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file")
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFile(selectedFile)
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const resetUpload = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      <motion.div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging
            ? "border-red-500 bg-red-500/10"
            : error
              ? "border-red-500 bg-red-500/5"
              : success
                ? "border-green-500 bg-green-500/5"
                : "border-gray-700 hover:border-gray-600"
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          disabled={isLoading}
        />

        <div className="space-y-3">
          {!file && !error && (
            <>
              <div className="mx-auto flex justify-center">
                <Upload className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">{description}</p>
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
            </>
          )}

          {file && !error && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <FileJson className="h-8 w-8 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>

              {isLoading ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : success ? (
                <div className="flex items-center justify-center text-green-500 space-x-1">
                  <Check className="h-5 w-5" />
                  <span>Upload successful!</span>
                </div>
              ) : (
                <div className="flex space-x-2 justify-center">
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="inline-flex items-center px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFile(file)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="flex items-center justify-center text-red-500 space-x-1">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={resetUpload}
                className="inline-flex items-center px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium text-white"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <p className="mt-2 text-xs text-gray-500">
        Accepted file types: {acceptedFileTypes} (Max size: {maxSizeMB}MB)
      </p>
    </div>
  )
}

