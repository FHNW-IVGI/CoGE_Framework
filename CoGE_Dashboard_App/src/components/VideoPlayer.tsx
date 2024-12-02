import React, { useEffect } from "react";

interface VideoPlayerProps {
  video: string;
  onTimeUpdate: (time: number) => void;
  onVideoLoaded: (duration: number) => void;
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  videoRef: React.RefObject<HTMLVideoElement>; // Pass video ref from parent
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onTimeUpdate,
  onVideoLoaded,
  startTime,
  endTime,
  videoRef,
}) => {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.currentTime = startTime; // Start from the filtered time
    }
  }, [video, startTime, videoRef]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.pause(); // Stop the video when it reaches the end time
      }
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onVideoLoaded(videoRef.current.duration);
      videoRef.current.currentTime = startTime; // Seek to start time when video metadata is loaded
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        width="600"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        controls={true} // Hides the default video controls
      >
        <source src={`/videos/${video}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
