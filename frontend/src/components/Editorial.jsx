import { useState, useRef, useEffect } from "react";
import { Pause, Play } from "lucide-react";

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  /* ---------- FORMAT TIME ---------- */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ---------- PLAY / PAUSE ---------- */
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /* ---------- TIME UPDATE ---------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  return (
    <div
      className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden
                 bg-black border border-base-content/10
                 shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* ================= VIDEO ================= */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video bg-black cursor-pointer"
      />

      {/* ================= GLASS CONTROLS ================= */}
      <div
        className={`absolute inset-x-0 bottom-0
          bg-gradient-to-t from-black/80 via-black/40 to-transparent
          transition-opacity duration-300
          ${isHovering || !isPlaying ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="p-4 backdrop-blur-sm">

          {/* Controls Row */}
          <div className="flex items-center gap-4">

            {/* Play / Pause */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full flex items-center justify-center
                         bg-emerald-600/90 hover:bg-emerald-600
                         text-white shadow-lg transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Time */}
            <span className="text-sm text-white/90 font-mono min-w-[48px]">
              {formatTime(currentTime)}
            </span>

            {/* Progress */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="range range-xs flex-1
                         [--range-bg:rgba(255,255,255,0.25)]
                         [--range-fill:rgb(16,185,129)]"
            />

            {/* Duration */}
            <span className="text-sm text-white/70 font-mono min-w-[48px] text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editorial;
