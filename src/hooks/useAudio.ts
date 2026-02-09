import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

// Helper to convert Tidal cover UUID to image URL
export function getTidalImageUrl(
  coverUuid: string | undefined,
  size: number = 320
): string {
  if (!coverUuid) return "";
  // Tidal cover UUIDs need to be converted: uuid with dashes -> path with slashes
  const path = coverUuid.replace(/-/g, "/");
  // Use standard Tidal sizes: 160, 320, 640, 1280
  // If an invalid size is requested, snap to the nearest supported size
  let validSize = 320;
  if (size <= 160) validSize = 160;
  else if (size <= 320) validSize = 320;
  else if (size <= 640) validSize = 640;
  else validSize = 1280;

  return `https://resources.tidal.com/images/${path}/${validSize}x${validSize}.jpg`;
}

export interface Track {
  id: number;
  title: string;
  artist?: { id: number; name: string };
  album?: { id: number; title: string; cover?: string };
  duration: number;
  audioQuality?: string;
}

export interface Playlist {
  uuid: string;
  title: string;
  description?: string;
  image?: string;
  numberOfTracks?: number;
  creator?: { id: number; name?: string };
}

export interface DeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id?: number;
}

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolumeState] = useState(1.0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);

  // Load saved auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        console.log("Loading saved auth...");
        const tokens = await invoke<AuthTokens | null>("load_saved_auth");
        console.log("Loaded tokens:", tokens);

        if (tokens) {
          // Get the user ID from session if not in tokens
          let userId = tokens.user_id;
          if (!userId) {
            try {
              userId = await invoke<number>("get_session_user_id");
              console.log("Got user ID from session:", userId);
            } catch (e) {
              console.error("Failed to get user ID:", e);
            }
          }

          const updatedTokens = { ...tokens, user_id: userId };
          setAuthTokens(updatedTokens);
          setIsAuthenticated(true);

          // Load playlists inline to avoid closure issues
          if (userId) {
            try {
              console.log("Loading playlists for user:", userId);
              const playlists = await invoke<Playlist[]>("get_user_playlists", {
                userId: userId,
              });
              console.log("Loaded playlists:", playlists?.length);
              setUserPlaylists(playlists || []);
            } catch (playlistErr) {
              console.error("Failed to load playlists:", playlistErr);
              setUserPlaylists([]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load saved auth:", err);
      }
    };

    loadAuth();
  }, []);

  // Auto-play next track when current finishes
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const checkInterval = setInterval(async () => {
      try {
        const isFinished = await invoke<boolean>("is_track_finished");
        if (isFinished && queue.length > 0) {
          playNext();
        }
      } catch (err) {
        console.error("Failed to check track status:", err);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isPlaying, currentTrack, queue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't intercept if typing
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isPlaying) {
            pauseTrack();
          } else {
            resumeTrack();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          playNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1.0, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0.0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume]);

  const startAuth = async (): Promise<DeviceCode> => {
    try {
      return await invoke("start_tidal_auth");
    } catch (error) {
      console.error("Failed to start auth:", error);
      throw error;
    }
  };

  const pollAuth = async (deviceCode: string): Promise<AuthTokens> => {
    try {
      const tokens = await invoke<AuthTokens>("poll_tidal_auth", {
        deviceCode: deviceCode,
      });

      // Get the user ID from session
      let userId = tokens.user_id;
      if (!userId) {
        try {
          userId = await invoke<number>("get_session_user_id");
        } catch (e) {
          console.error("Failed to get user ID:", e);
        }
      }

      const updatedTokens = { ...tokens, user_id: userId };
      setAuthTokens(updatedTokens);
      setIsAuthenticated(true);
      return updatedTokens;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await invoke("logout");
      setAuthTokens(null);
      setIsAuthenticated(false);
      setUserPlaylists([]);
      setCurrentTrack(null);
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getUserPlaylists = async (userId: number): Promise<Playlist[]> => {
    try {
      const playlists = await invoke<Playlist[]>("get_user_playlists", {
        userId: userId,
      });
      setUserPlaylists(playlists);
      return playlists;
    } catch (error) {
      console.error("Failed to get playlists:", error);
      return [];
    }
  };

  const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
    try {
      console.log("Getting playlist tracks for:", playlistId);
      const tracks = await invoke<Track[]>("get_playlist_tracks", {
        playlistId: playlistId,
      });
      console.log("Got tracks:", tracks?.length);
      return tracks || [];
    } catch (error: any) {
      console.error("Failed to get playlist tracks:", error);
      alert(`Failed to get tracks: ${error?.message || error}`);
      return [];
    }
  };

  const playTrack = async (track: Track) => {
    try {
      console.log("Invoking play_tidal_track with trackId:", track.id);
      await invoke("play_tidal_track", { trackId: track.id });
      console.log("Play invoked successfully");
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error: any) {
      console.error("Failed to play track:", error);
      alert(`Failed to play: ${error?.message || error}`);
    }
  };

  const pauseTrack = async () => {
    try {
      await invoke("pause_track");
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to pause track:", error);
    }
  };

  const resumeTrack = async () => {
    try {
      await invoke("resume_track");
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to resume track:", error);
    }
  };

  const setVolume = async (level: number) => {
    try {
      await invoke("set_volume", { level });
      setVolumeState(level);
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const playNext = useCallback(async () => {
    if (queue.length > 0) {
      const [nextTrack, ...rest] = queue;
      setQueue(rest);
      await playTrack(nextTrack);
    } else {
      setIsPlaying(false);
    }
  }, [queue]);

  return {
    isPlaying,
    currentTrack,
    volume,
    queue,
    isAuthenticated,
    userPlaylists,
    authTokens,
    playTrack,
    pauseTrack,
    resumeTrack,
    setVolume,
    addToQueue,
    playNext,
    startAuth,
    pollAuth,
    logout,
    getUserPlaylists,
    getPlaylistTracks,
  };
}
