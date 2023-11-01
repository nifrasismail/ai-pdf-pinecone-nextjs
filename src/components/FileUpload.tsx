"use client";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadToFirebaseBucket } from "@/lib/firebase";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

type Props = {};

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { mutate, status } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
    }: {
      fileKey: string;
      fileName: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToFirebaseBucket(file);
        if (!data?.fileKey || !data?.fileName) {
          toast.error("Something went wrong");
          return;
        }

        mutate(data, {
          onSuccess: ({ chatId }) => {
            toast.success("Chat has been created", chatId);
          },
          onError: (err) => {
            console.log(err);
          },
        });
        console.log(data);
      } catch (error) {
        toast.error("Error creating chat");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed w-[350px] border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center flex-col items-center",
        })}
      >
        <input {...getInputProps()} />
        {uploading == true ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Analyzing PDF on GPT ${status}
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
