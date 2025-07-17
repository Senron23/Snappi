"use client";
import FileInput from "@/components/FileInput";
import FormField from "@/components/FormField";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import {
  getThumbnailUploadUrl,
  getVideoUploadUrl,
  saveVideoDetails,
} from "@/lib/actions/video";
import { useFileInput } from "@/lib/hooks/useFileinput";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, use, useEffect, useState } from "react";

const uploadFileToBunny = (
  file: File,
  uploadUrl: string,
  accessKey: string
): Promise<void> => {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if (!response.ok) throw new Error("Upload failed");
  });
};

const page = () => {
  const router = useRouter();
  const [isSubmitting, setisSubmitting] = useState(false);
  const [videoDuration, setvideoDuration] = useState(0);

  // State to manage form data and errors
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });

  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);
  useEffect(() => {
    if (!video.duration !== null || 0) {
      setvideoDuration(video.duration);
    }
  }, [video.duration]);

  useEffect(() => {
    const checkForRecordedVideo = async ()=>{
      try {
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;
        const {url, name, type, size, duration} = JSON.parse(stored);
        const blob =await fetch(url).then((res) => res.blob());
        const file = new File([blob], name, {type, lastModified: Date.now()});
        if(video.inputRef.current){
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          video.inputRef.current.files = dataTransfer.files;
          const event = new Event('change', {
            bubbles: true,});
            video.inputRef.current.dispatchEvent(event);
            video.handleFileChange({
              target: {files: dataTransfer.files}
            } as ChangeEvent<HTMLInputElement>);
        }

        if(duration) setvideoDuration(duration);

        sessionStorage.removeItem('recordedVideo')
        URL.revokeObjectURL(url); // Clean up the URL
      } catch (e) {
        console.error(e, 'Error loading recorded video');
      }
    }
    checkForRecordedVideo();
  },[video]);

  const [error, setError] = useState("");

  // Function to handle form submission
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setisSubmitting(true);

    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload video and thumbnail");
        return;
      }
      if (!formData.title || !formData.description) {
        setError("Please fill in all the details");
        return;
      }

      //0 get upload url
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey)
        throw new Error("Failed to get video upload credentials");
      //1. Upload the video to Bunny
      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      // Upload the thumbnail to db
      const {
        uploadUrl: thumbnailUploadUrl,
        accessKey: thumbnailAccessKey,
        cdnUrl: thumbnailCdnUrl,
      } = await getThumbnailUploadUrl(videoId);

      if (!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey)
        throw new Error("Failed to get thumbnail upload credentials");
      // Attach thumbnail
      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey
      );
      // Create a new db entry for the video details (urls,data)
      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCdnUrl,
        ...formData,
        visibility: formData.visibility as Visibility,
        duration: videoDuration,
      });

      router.push(`/`);
    } catch (error) {
      console.log("Error Submitting Form: ", error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <div className="wrapper-md upload-page">
      <h1>Upload a Video</h1>

      {error && <div className="error-field">{error}</div>}
      <form
        className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5"
        onSubmit={handleSubmit}
      >
        <FormField
          id="title"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter video title"
        />
        <FormField
          id="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          as="textarea"
          placeholder="Enter video description"
        />
        <FileInput
          id="video"
          label="Video"
          accept="video/*"
          file={video.file}
          inputRef={video.inputRef}
          previewUrl={video.previewUrl}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />
        <FileInput
          id="thumnail"
          label="Thumbnail"
          accept="image/*"
          file={thumbnail.file}
          inputRef={thumbnail.inputRef}
          previewUrl={thumbnail.previewUrl}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />
        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleInputChange}
          as="select"
          options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Private" },
          ]}
        />
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default page;
