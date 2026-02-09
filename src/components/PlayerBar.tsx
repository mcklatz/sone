import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Mic2,
  MonitorSpeaker,
  ChevronLeft,
} from "lucide-react";
import { useAudioContext } from "../contexts/AudioContext";
import { getTidalImageUrl } from "../hooks/useAudio";
import TidalImage from "./TidalImage";
import { useState, useEffect, useRef } from "react";

export default function PlayerBar() {
  const {
    isPlaying,
    currentTrack,
    volume,
    pauseTrack,
    resumeTrack,
    setVolume,
    playNext,
  } = useAudioContext();
  const [localVolume, setLocalVolume] = useState(volume);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev >= currentTrack.duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      setProgress((currentTime / currentTrack.duration) * 100);
    }
  }, [currentTime, currentTrack]);

  useEffect(() => {
    setCurrentTime(0);
    setProgress(0);
  }, [currentTrack?.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(percent * currentTrack.duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

  const VolumeIcon =
    localVolume === 0 ? VolumeX : localVolume < 0.5 ? Volume1 : Volume2;

  const getQualityBadge = () => {
    if (!currentTrack?.audioQuality) return null;

    // Tidal uses specific colors for badges
    let bgColor = "#555"; // HIGH (Standard)
    let textColor = "white";
    let label = "HIGH";

    if (
      currentTrack.audioQuality === "HI_RES_LOSSLESS" ||
      currentTrack.audioQuality === "HI_RES"
    ) {
      bgColor = "#ffd43b"; // Master/Max Gold
      textColor = "black";
      label = "MAX";
    } else if (currentTrack.audioQuality === "LOSSLESS") {
      bgColor = "#00ffff"; // HiFi Cyan
      textColor = "black";
      label = "HiFi";
    }

    return (
      <span
        className="px-[5px] py-[1px] text-[9px] font-black rounded-[2px] tracking-wider shadow-sm"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="h-[96px] bg-[#181818] border-t border-[#222] px-6 flex items-center justify-between relative z-50">
      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-[56px] h-[56px] rounded-[3px] bg-[#282828] flex-shrink-0 overflow-hidden shadow-lg group relative cursor-pointer">
              <TidalImage
                src={getTidalImageUrl(currentTrack.album?.cover, 160)}
                alt={currentTrack.album?.title || currentTrack.title}
                className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ChevronLeft className="text-white rotate-90" size={24} />
              </div>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-bold text-[14px] truncate hover:underline cursor-pointer tracking-wide">
                  {currentTrack.title}
                </span>
              </div>
              <span className="text-[#a6a6a6] text-[13px] truncate hover:text-white hover:underline cursor-pointer transition-colors font-medium">
                {currentTrack.artist?.name || "Unknown Artist"}
              </span>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`ml-2 transition-transform active:scale-90 ${
                isLiked ? "text-[#00ffff]" : "text-[#a6a6a6] hover:text-white"
              }`}
            >
              <Heart
                size={20}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
          </>
        ) : (
          <div className="text-[#a6a6a6] text-sm font-medium">
            No track playing
          </div>
        )}
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center w-[40%] max-w-[600px] gap-1">
        <div className="flex items-center gap-6 mb-1">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`transition-colors active:scale-95 ${
              isShuffle ? "text-[#00ffff]" : "text-[#a6a6a6] hover:text-white"
            }`}
          >
            <Shuffle size={18} strokeWidth={2.5} />
          </button>
          <button className="text-white hover:text-[#00ffff] transition-colors active:scale-95">
            <SkipBack size={26} fill="currentColor" />
          </button>
          <button
            onClick={() => (isPlaying ? pauseTrack() : resumeTrack())}
            className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? (
              <Pause size={22} fill="black" className="text-black" />
            ) : (
              <Play size={22} fill="black" className="text-black ml-1" />
            )}
          </button>
          <button
            onClick={playNext}
            className="text-white hover:text-[#00ffff] transition-colors active:scale-95"
          >
            <SkipForward size={26} fill="currentColor" />
          </button>
          <button
            onClick={() => setRepeatMode((repeatMode + 1) % 3)}
            className={`transition-colors active:scale-95 relative ${
              repeatMode > 0
                ? "text-[#00ffff]"
                : "text-[#a6a6a6] hover:text-white"
            }`}
          >
            <Repeat size={18} strokeWidth={2.5} />
            {repeatMode === 2 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold">
                1
              </span>
            )}
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-[11px] font-medium font-mono text-[#a6a6a6]">
          <span className="min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-[#333] rounded-full cursor-pointer group relative"
          >
            <div
              className="absolute h-full bg-[#00ffff] rounded-full transition-all group-hover:bg-white"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute w-3 h-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md transform scale-50 group-hover:scale-100 transition-transform"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="min-w-[35px]">
            {currentTrack ? formatTime(currentTrack.duration) : "0:00"}
          </span>
        </div>
      </div>

      {/* Right: Volume & Extra */}
      <div className="flex items-center justify-end gap-5 w-[30%] min-w-[200px]">
        {getQualityBadge()}

        <button className="text-[#a6a6a6] hover:text-white transition-colors">
          <Mic2 size={20} strokeWidth={2} />
        </button>

        <button className="text-[#a6a6a6] hover:text-white transition-colors">
          <MonitorSpeaker size={20} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2 group w-28">
          <button
            onClick={() => {
              const newVol = localVolume > 0 ? 0 : 1;
              setLocalVolume(newVol);
              setVolume(newVol);
            }}
            className="text-[#a6a6a6] hover:text-white transition-colors"
          >
            <VolumeIcon size={20} strokeWidth={2} />
          </button>
          <div className="flex-1 h-1 bg-[#333] rounded-full relative cursor-pointer">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localVolume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute h-full bg-white rounded-full transition-all group-hover:bg-[#00ffff]"
              style={{ width: `${localVolume * 100}%` }}
            />
          </div>
        </div>

        <button className="text-[#a6a6a6] hover:text-white transition-colors">
          <ListMusic size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
