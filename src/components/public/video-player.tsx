"use client";

import { useState, useEffect, useRef } from "react";
import { VideoPreRollAd } from "@/components/ads/VideoPreRollAd";
import { Play, Pause, Volume2, VolumeX, Settings, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  nextVideoUrl?: string;
}

export function VideoPlayer({ videoUrl, posterUrl, nextVideoUrl }: VideoPlayerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [adFinished, setAdFinished] = useState(false);

  // Custom Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [quality, setQuality] = useState("720p HD");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [hoverLeft, setHoverLeft] = useState(0);
  const [flashAction, setFlashAction] = useState<"play" | "pause" | null>(null);
  const [bufferedProgress, setBufferedProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse activity tracking to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const handleMouseLeave = () => {
    setShowQualityMenu(false);
    setShowSettingsMenu(false);
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      handleMouseMove();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Clean up theater mode on unmount
  useEffect(() => {
    return () => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.classList.remove("theater-mode");
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in inputs or textareas (e.g., share popup URL input)
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!videoRef.current || !hasStarted || !adFinished) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case "arrowright":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          break;
        case "arrowup":
          e.preventDefault();
          const volUp = Math.min(1, videoRef.current.volume + 0.05);
          videoRef.current.volume = volUp;
          setVolume(volUp);
          if (volUp > 0) setIsMuted(false);
          break;
        case "arrowdown":
          e.preventDefault();
          const volDown = Math.max(0, videoRef.current.volume - 0.05);
          videoRef.current.volume = volDown;
          setVolume(volDown);
          if (volDown === 0) setIsMuted(true);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "t":
          e.preventDefault();
          toggleTheaterMode();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasStarted, adFinished, duration, isMuted, volume, isTheaterMode, isPlaying]);

  // Sync fullscreen change back to state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  // Play/Pause Action Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => console.log("Play failed:", err));
      setIsPlaying(true);
      setFlashAction("play");
      setTimeout(() => setFlashAction(null), 500);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setFlashAction("pause");
      setTimeout(() => setFlashAction(null), 500);
    }
  };

  // Skip/Autoplay to next video
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (isAutoplay && nextVideoUrl) {
      window.location.href = nextVideoUrl;
    }
  };

  // Volume Handlers
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      const isNewMuted = newVol === 0;
      videoRef.current.muted = isNewMuted;
      setIsMuted(isNewMuted);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    videoRef.current.muted = newMuteState;
    if (!newMuteState && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Progress Bar Seek Controls
  const handleSeek = (percentage: number) => {
    if (!videoRef.current || duration === 0) return;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    handleSeek(percentage);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const dragSeek = (moveEvent: MouseEvent) => {
      const rect = progressBarRef.current!.getBoundingClientRect();
      const dragX = moveEvent.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, dragX / width));
      handleSeek(percentage);
    };

    dragSeek(e.nativeEvent);

    const handleMouseMoveGlobal = (moveEvent: MouseEvent) => {
      dragSeek(moveEvent);
    };

    const handleMouseUpGlobal = () => {
      document.removeEventListener("mousemove", handleMouseMoveGlobal);
      document.removeEventListener("mouseup", handleMouseUpGlobal);
    };

    document.addEventListener("mousemove", handleMouseMoveGlobal);
    document.addEventListener("mouseup", handleMouseUpGlobal);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, hoverX / width));
    const hoverSeconds = percentage * duration;
    setHoverTime(formatTime(hoverSeconds));
    setHoverLeft((hoverX / width) * 100);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  // Quality Toggle buffering simulation
  const handleQualityChange = (newQuality: string) => {
    setIsBuffering(true);
    setShowQualityMenu(false);
    setQuality(newQuality);

    if (videoRef.current) {
      const wasPlaying = !videoRef.current.paused;
      if (wasPlaying) {
        videoRef.current.pause();
      }
      setTimeout(() => {
        setIsBuffering(false);
        if (wasPlaying && videoRef.current) {
          videoRef.current.play().catch((err) => console.log(err));
        }
      }, 600);
    }
  };

  // Playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Layout mode toggles
  const toggleTheaterMode = () => {
    const nextTheaterState = !isTheaterMode;
    setIsTheaterMode(nextTheaterState);

    const mainElement = document.querySelector("main");
    if (mainElement) {
      if (nextTheaterState) {
        mainElement.classList.add("theater-mode");
      } else {
        mainElement.classList.remove("theater-mode");
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  // Native Video Events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Sync buffer information
    if (videoRef.current.buffered.length > 0 && duration > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedProgress((bufferedEnd / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  if (!hasStarted) {
    return (
      <div 
        onClick={() => setHasStarted(true)}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-muted group flex items-center justify-center select-none cursor-pointer"
      >
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt="Video Poster" 
            className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0c0c0c] flex items-center justify-center opacity-60 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
        )}
        
        {/* Play Button Overlay */}
        <div 
          className="relative z-20 h-20 w-20 rounded-full bg-[#ffa31a] group-hover:bg-[#ffb74d] text-black flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(255,163,26,0.3)] group-hover:shadow-[0_0_30px_rgba(255,163,26,0.5)]"
        >
          <Play className="h-10 w-10 fill-current ml-1.5" />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-video bg-black shadow-2xl border border-muted overflow-hidden select-none group/player ${
        isTheaterMode && !isFullscreen ? "rounded-none" : "rounded-xl"
      }`}
    >
      {!adFinished ? (
        <VideoPreRollAd posterUrl={posterUrl} onComplete={() => setAdFinished(true)} />
      ) : (
        <>
          {/* Main Video Element */}
          <video 
            ref={videoRef}
            src={videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} 
            poster={posterUrl}
            autoPlay 
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={handleVideoEnded}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Buffering Loading Spinner Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 pointer-events-none">
              <Loader2 className="h-14 w-14 text-[#ffa31a] animate-spin" />
            </div>
          )}

          {/* Play/Pause flash animations */}
          {flashAction && (
            <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none animate-ping animate-duration-300">
              <div className="h-20 w-20 rounded-full bg-black/60 flex items-center justify-center text-[#ffa31a] border border-[#ffa31a]/20 shadow-2xl">
                {flashAction === "play" ? (
                  <Play className="h-10 w-10 fill-current ml-1" />
                ) : (
                  <Pause className="h-10 w-10 fill-current" />
                )}
              </div>
            </div>
          )}

          {/* Custom Pornhub Video Controller Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 pointer-events-auto bg-gradient-to-t from-black/95 via-black/75 to-transparent pb-3 pt-8 px-4 flex flex-col gap-2 ${
              showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            {/* Progress Bar Container */}
            <div 
              ref={progressBarRef}
              onClick={handleProgressClick}
              onMouseMove={handleProgressMouseMove}
              onMouseLeave={handleProgressMouseLeave}
              onMouseDown={handleProgressMouseDown}
              className="relative w-full h-1.5 bg-[#2c2c2c] cursor-pointer rounded-full overflow-visible group/seek"
            >
              {/* Buffered progress fill */}
              <div 
                style={{ width: `${bufferedProgress}%` }}
                className="absolute top-0 bottom-0 left-0 bg-white/20 transition-all duration-150"
              />
              
              {/* Playing progress fill */}
              <div 
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                className="absolute top-0 bottom-0 left-0 bg-[#ffa31a] rounded-full"
              />
              
              {/* Hover thumb/marker knob */}
              <div 
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border border-[#ffa31a] scale-0 group-hover/seek:scale-100 transition-transform shadow-md pointer-events-none"
              />

              {/* Hover time tooltip */}
              {hoverTime && (
                <div 
                  style={{ left: `${hoverLeft}%` }}
                  className="absolute bottom-4 -translate-x-1/2 bg-[#101010] border border-[#232323] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none font-sans"
                >
                  {hoverTime}
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between w-full text-white text-sm select-none mt-1 h-9">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button 
                  onClick={togglePlay}
                  className="hover:text-[#ffa31a] transition-colors cursor-pointer"
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>

                {/* Next/Skip Button */}
                <button 
                  onClick={() => {
                    if (nextVideoUrl) {
                      window.location.href = nextVideoUrl;
                    }
                  }}
                  disabled={!nextVideoUrl}
                  className={`transition-colors cursor-pointer ${
                    nextVideoUrl ? "hover:text-[#ffa31a] text-white" : "text-neutral-500 cursor-not-allowed"
                  }`}
                  title="Next Video"
                >
                  {/* Triangle Play icon pointing right with vertical line (SkipForward shape) */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18V6l10 6L6 18zM17 6h2v12h-2V6z" />
                  </svg>
                </button>

                {/* Time Display: 00:00 / 10:34 */}
                <div className="text-white text-xs font-semibold font-sans tracking-wide">
                  {formatTime(currentTime)} <span className="text-neutral-400">/</span> {formatTime(duration)}
                </div>

                {/* Volume Control */}
                <div className="flex items-center group/volume relative">
                  <button 
                    onClick={toggleMute}
                    className="hover:text-[#ffa31a] transition-colors cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : volume < 0.4 ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Horizontal volume slider that slides out on hover */}
                  <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ml-2 flex items-center h-5">
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-[#ffa31a]"
                      style={{
                        background: `linear-gradient(to right, #ffa31a 0%, #ffa31a ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-4 relative">
                {/* Autoplay Toggle Switch */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider">AUTO</span>
                  <div 
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`w-[44px] h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${
                      isAutoplay ? "bg-[#ffa31a]" : "bg-[#2c2c2c]"
                    }`}
                    title="Autoplay Next Video"
                  >
                    {/* Knob */}
                    <div 
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 flex items-center justify-center transition-all duration-300 shadow-md ${
                        isAutoplay ? "left-[21px]" : "left-0.5"
                      }`}
                    >
                      {/* Play icon in Knob */}
                      <svg 
                        viewBox="0 0 24 24" 
                        className={`h-2.5 w-2.5 fill-current ${isAutoplay ? "text-[#ffa31a]" : "text-neutral-500"}`} 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Quality Badge Capsule */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSettingsMenu(false);
                    }}
                    className="bg-black/60 hover:bg-black/80 text-white font-extrabold text-[11px] px-3 py-1 rounded-full border border-neutral-800 transition-colors tracking-wide h-6 flex items-center justify-center cursor-pointer min-w-[70px]"
                  >
                    {quality}
                  </button>

                  {/* Quality Menu Dropdown */}
                  {showQualityMenu && (
                    <div className="absolute bottom-8 right-0 bg-[#101010]/95 border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-40 min-w-[90px] font-sans font-semibold text-xs flex flex-col text-white">
                      {["1080p HD", "720p HD", "480p", "Auto"].map((q) => (
                        <button 
                          key={q}
                          onClick={() => handleQualityChange(q)}
                          className={`px-3 py-1.5 text-left hover:bg-[#ffa31a]/15 hover:text-[#ffa31a] transition-colors cursor-pointer ${
                            quality === q ? "text-[#ffa31a] bg-[#ffa31a]/5" : ""
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings Gear Cog */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      setShowQualityMenu(false);
                    }}
                    className="hover:text-[#ffa31a] text-white transition-colors cursor-pointer flex items-center justify-center h-5 w-5"
                    title="Playback Speed"
                  >
                    <Settings className="h-5 w-5" />
                  </button>

                  {/* Settings Menu Dropdown */}
                  {showSettingsMenu && (
                    <div className="absolute bottom-8 right-0 bg-[#101010]/95 border border-[#2a2a2a] rounded-lg shadow-xl py-1.5 z-40 min-w-[120px] font-sans font-semibold text-xs flex flex-col text-white">
                      <div className="px-3 py-1 border-b border-[#2a2a2a] text-[10px] text-neutral-400 tracking-wider font-bold mb-1">
                        SPEED
                      </div>
                      {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                        <button 
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-3 py-1.5 text-left hover:bg-[#ffa31a]/15 hover:text-[#ffa31a] transition-colors cursor-pointer ${
                            playbackSpeed === s ? "text-[#ffa31a] bg-[#ffa31a]/5" : ""
                          }`}
                        >
                          {s === 1 ? "Normal" : `${s}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theater Mode Button */}
                <button 
                  onClick={toggleTheaterMode}
                  className="hover:text-[#ffa31a] text-white transition-colors cursor-pointer flex items-center justify-center"
                  title={isTheaterMode ? "Default View (t)" : "Theater Mode (t)"}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                    <path d="M21 7H3M21 17H3" strokeWidth="1" className="opacity-50" />
                  </svg>
                </button>

                {/* Fullscreen Button */}
                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-[#ffa31a] text-white transition-colors cursor-pointer flex items-center justify-center"
                  title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.5]" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V3M9 9H3M15 9V3M15 9h6M9 15v6M9 15H3M15 15v6M15 15h6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.5]" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 3H3v6M15 21h6v-6M9 21H3v-6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
