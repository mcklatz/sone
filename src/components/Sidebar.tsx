import { Home, Compass, Search, Plus, Library } from "lucide-react";
import { useAudioContext } from "../contexts/AudioContext";
import { getTidalImageUrl } from "../hooks/useAudio";
import TidalImage from "./TidalImage";
import { useState } from "react";

export default function Sidebar() {
  const { userPlaylists, getPlaylistTracks, playTrack } = useAudioContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handlePlaylistClick = async (playlistId: string) => {
    try {
      const tracks = await getPlaylistTracks(playlistId);
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
    } catch (err) {
      console.error("Failed to play playlist:", err);
    }
  };

  return (
    <div
      className={`h-full bg-[#0b0b0b] flex flex-col border-r border-[#1a1a1a] transition-all duration-300 ${
        isCollapsed ? "w-[78px]" : "w-[260px]"
      } flex-shrink-0`}
    >
      {/* Navigation */}
      <nav className="px-3 pt-4 pb-2 space-y-1">
        <a
          href="#"
          className={`flex items-center gap-4 px-3 py-2.5 text-white hover:bg-[#1a1a1a] rounded-md transition-colors group ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Home"
        >
          <Home
            size={22}
            strokeWidth={2}
            className="text-white group-hover:text-white"
          />
          {!isCollapsed && (
            <span className="font-semibold text-[15px]">Home</span>
          )}
        </a>
        <a
          href="#"
          className={`flex items-center gap-4 px-3 py-2.5 text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors group ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Explore"
        >
          <Compass size={22} strokeWidth={2} />
          {!isCollapsed && (
            <span className="font-semibold text-[15px]">Explore</span>
          )}
        </a>
        <a
          href="#"
          className={`flex items-center gap-4 px-3 py-2.5 text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors group ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Search"
        >
          <Search size={22} strokeWidth={2} />
          {!isCollapsed && (
            <span className="font-semibold text-[15px]">Search</span>
          )}
        </a>
      </nav>

      {/* Library Header */}
      <div className="flex-1 flex flex-col min-h-0 mt-1">
        <div
          className={`px-3 py-2 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors group ${
              isCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <Library size={22} />
            {!isCollapsed && (
              <span className="font-semibold text-[15px]">Your Library</span>
            )}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <button className="text-[#b3b3b3] hover:text-white p-1 rounded-full hover:bg-[#1a1a1a] transition-colors">
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Filter Pills (Only visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {["Playlists", "Artists", "Albums"].map((pill) => (
              <button
                key={pill}
                className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full text-[13px] font-semibold text-white whitespace-nowrap transition-colors"
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 hover:scrollbar-thin scrollbar-thumb-[#4d4d4d] scrollbar-track-transparent">
          {userPlaylists.length === 0 ? (
            <div
              className={`px-3 py-8 text-center ${isCollapsed ? "hidden" : ""}`}
            >
              <p className="text-[#a6a6a6] text-sm">
                Create your first playlist
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform">
                Create playlist
              </button>
            </div>
          ) : (
            <div className="space-y-0.5 mt-1">
              {userPlaylists.map((playlist) => (
                <button
                  key={playlist.uuid}
                  onClick={() => handlePlaylistClick(playlist.uuid)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors group ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                  title={playlist.title}
                >
                  <div
                    className={`bg-[#282828] flex-shrink-0 overflow-hidden shadow-lg ${
                      isCollapsed ? "w-12 h-12 rounded-md" : "w-12 h-12 rounded"
                    }`}
                  >
                    <TidalImage
                      src={getTidalImageUrl(playlist.image, 160)}
                      alt={playlist.title}
                      type="playlist"
                    />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[15px] font-medium text-white truncate mb-0.5">
                        {playlist.title}
                      </div>
                      <div className="flex items-center gap-1 text-[13px] text-[#a6a6a6] truncate">
                        <span>Playlist</span>
                        <span>•</span>
                        <span>{playlist.creator?.name || "You"}</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
