import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import axiosClient from "../utils/axiosClient";

function AdminUpload() {
  const { problemId } = useParams();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const selectedFile = watch("videoFile")?.[0];

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data) => {
    const file = data.videoFile[0];

    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(
        `/video/create/${problemId}`
      );

      const {
        signature,
        timestamp,
        public_id,
        api_key,
        upload_url,
      } = signatureResponse.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("public_id", public_id);
      formData.append("api_key", api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post("/video/save", {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error("Upload error:", err);
      setError("root", {
        type: "manual",
        message:
          err.response?.data?.message ||
          "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* CARD */}
      <div className="bg-base-100/50 backdrop-blur
                      border border-base-content/10
                      rounded-xl p-6">

        <h2 className="text-2xl font-bold text-success mb-1">
          Upload Video
        </h2>
        <p className="text-sm text-base-content/60 mb-6">
          Upload editorial or solution video for this problem
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* FILE INPUT */}
          <div>
            <label className="text-sm font-medium">
              Choose video file
            </label>
            <input
              type="file"
              accept="video/*"
              disabled={uploading}
              {...register("videoFile", {
                required: "Please select a video file",
                validate: {
                  isVideo: (files) =>
                    files?.[0]?.type.startsWith("video/") ||
                    "Please select a valid video file",
                  fileSize: (files) =>
                    files?.[0]?.size <= 100 * 1024 * 1024 ||
                    "File size must be less than 100MB",
                },
              })}
              className={`file-input file-input-bordered w-full mt-1
                ${errors.videoFile ? "file-input-error" : ""}`}
            />

            {errors.videoFile && (
              <p className="text-error text-sm mt-1">
                {errors.videoFile.message}
              </p>
            )}
          </div>

          {/* FILE INFO */}
          {selectedFile && (
            <div className="bg-base-200/60 backdrop-blur
                            border border-base-content/10
                            rounded-lg p-3 text-sm">
              <p className="font-medium">Selected File</p>
              <p>{selectedFile.name}</p>
              <p className="text-base-content/60">
                Size: {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}

          {/* PROGRESS */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <progress
                className="progress w-full
                           [--progress-fill:rgb(16,185,129)]"
                value={uploadProgress}
                max="100"
              />
            </div>
          )}

          {/* ERROR */}
          {errors.root && (
            <div className="alert alert-error bg-base-100/60 backdrop-blur">
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* SUCCESS */}
          {uploadedVideo && (
            <div className="alert alert-success bg-base-100/60 backdrop-blur">
              <div>
                <p className="font-semibold">
                  Upload successful 🎉
                </p>
                <p className="text-sm">
                  Duration: {formatDuration(uploadedVideo.duration)}
                </p>
                <p className="text-sm">
                  Uploaded:{" "}
                  {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* ACTION */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className={`btn rounded-full px-6
                bg-emerald-600/90 text-white
                hover:bg-emerald-600
                ${uploading ? "btn-disabled" : ""}`}
            >
              {uploading ? "Uploading…" : "Upload Video"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminUpload;
