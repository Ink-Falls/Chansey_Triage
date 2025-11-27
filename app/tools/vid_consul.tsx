import React, { useState } from 'react';
import { Phone, Mic, MicOff, User, Clock, Video, VideoOff } from 'lucide-react';

export default function VideoCallApp() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-300 via-blue-300 to-purple-400 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-900 font-medium text-sm">Video/Audio Consultation</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 px-6 pb-6 flex flex-col items-center justify-center">
        <div className="text-center">
          {/* Doctor Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-300 via-blue-300 to-purple-400 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg">
            MS
          </div>

          {/* Doctor Name */}
          <h3 className="text-gray-900 text-xl font-semibold mb-8">Maria Santos</h3>

          {/* Call Duration */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          <p className="text-gray-600 text-xs">05:42</p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-10">
        <div className="flex items-center justify-center gap-8">
          {/* End Call Button */}
          <div className="text-center">
            <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all mb-2">
              <Phone className="w-6 h-6 text-white transform rotate-135" />
            </button>
            <p className="text-gray-600 text-xs">Decline</p>
          </div>

          {/* Mute Button */}
          <div className="text-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all mb-2 ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-gray-700" />
              )}
            </button>
            <p className="text-gray-600 text-xs">Mute</p>
          </div>

          {/* Video Toggle Button */}
          <div className="text-center">
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all mb-2 ${
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-gray-700" />
              )}
            </button>
            <p className="text-gray-600 text-xs">Video</p>
          </div>

          {/* Speaker Button */}
          <div className="text-center">
            <button className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md hover:bg-gray-200 transition-all mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-gray-600 text-xs">Audio</p>
          </div>
        </div>
      </div>
    </div>
  );
}