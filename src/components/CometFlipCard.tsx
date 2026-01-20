"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Download, Loader2, RotateCw, PlayCircle, BarChart3 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- TYPES ---
export interface FlipCardData {
  overallScore: number;
  // Stats for the radar/bar chart (optional if you just want visual)
  stats?: { name: string; value: number; fill: string }[]; 
  homework: { title: string; desc: string }[];
  coachName: string;
}

// --- HELPER: Youtube Link Generator ---
const getVideoLink = (title: string) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " football drill")}`;
};

const CometFlipCard = ({ 
  data, 
  playerImg, 
  playerName, 
  playerId 
}: { 
  data: FlipCardData | null, 
  playerImg: string, 
  playerName: string, 
  playerId: string 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // --- DOWNLOAD FIX LOGIC ---
  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!cardRef.current) return;
    setDownloading(true);

    // 1. SAVE CURRENT STATE
    const originalTransform = cardRef.current.style.transform;
    const originalTransition = cardRef.current.style.transition;

    // 2. FORCE STYLES FOR CLEAN CAPTURE
    // We remove the 3D rotation so the image isn't mirrored.
    // We manually set z-indexes to ensure the correct side is shown.
    cardRef.current.style.transition = "none";
    cardRef.current.style.transform = "none";

    const frontFace = cardRef.current.querySelector('.front-face') as HTMLElement;
    const backFace = cardRef.current.querySelector('.back-face') as HTMLElement;

    if (isFlipped) {
        // If looking at back, hide front, show back normally
        if(frontFace) frontFace.style.display = 'none';
        if(backFace) {
            backFace.style.transform = "none"; // Remove the 180deg from the back face itself
            backFace.style.display = 'flex';
        }
    } else {
        // If looking at front, hide back
        if(backFace) backFace.style.display = 'none';
    }

    try {
        // 3. CAPTURE
        const canvas = await html2canvas(cardRef.current, { 
            useCORS: true, 
            scale: 2, 
            backgroundColor: null,
            logging: false
        });
        const imgData = canvas.toDataURL("image/png");

        if (format === 'png') {
            const link = document.createElement("a");
            link.href = imgData;
            link.download = `${playerName}_${isFlipped ? 'Homework' : 'Card'}.png`;
            link.click();
        } else {
            const pdf = new jsPDF("p", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${playerName}_${isFlipped ? 'Homework' : 'Card'}.pdf`);
        }
    } catch (err) {
        console.error("Download failed", err);
    } finally {
        // 4. RESTORE STATE
        if(frontFace) frontFace.style.display = '';
        if(backFace) {
            backFace.style.display = '';
            backFace.style.transform = ''; // Restore CSS class handling
        }
        cardRef.current.style.transform = originalTransform;
        cardRef.current.style.transition = originalTransition;
        setDownloading(false);
    }
  };

  // Safe check for data
  if (!data) return <div className="text-gray-400 text-sm">No Data Available</div>;
  const homework = data.homework || [];

  return (
    <div className="flex flex-col gap-6 items-center w-full">
        
        {/* === 3D FLIP CONTAINER === */}
        <div 
          className="w-full max-w-[400px] h-[550px] [perspective:1000px] group cursor-pointer" 
          onClick={() => setIsFlipped(!isFlipped)}
        >
            <div 
              ref={cardRef} 
              className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
            >
                
                {/* ==============================
                    FRONT FACE (COMET DESIGN) 
                   ============================== */}
                <div className="front-face absolute w-full h-full [backface-visibility:hidden] bg-[#121212] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-800">
                    
                    {/* Starry Background Image Area */}
                    <div className="relative h-[85%] w-full bg-black">
                        {/* Background Image */}
                        <Image 
                           src="/" 
                           alt="Cosmos"
                           fill
                           className="object-cover opacity-80"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                        
                        {/* Player Image Centered */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-40 h-40 rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden backdrop-blur-sm">
                                <Image 
                                  src={playerImg || "/noAvatar.png"} 
                                  alt="Player" 
                                  fill 
                                  className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-xs font-mono">
                            OVR <span className="font-bold text-[#4ADE80] text-sm ml-1">{data.overallScore}</span>
                        </div>
                    </div>

                    {/* Bottom Info Area */}
                    <div className="h-[15%] px-6 flex items-center justify-between bg-[#121212]">
                        <div>
                            <h2 className="text-white font-mono text-lg font-bold tracking-wide">{playerName}</h2>
                            <p className="text-gray-500 font-mono text-xs mt-1">ID: {playerId.slice(0, 8)}...</p>
                        </div>
                        <div className="animate-pulse">
                             <RotateCw className="text-gray-600 w-5 h-5" />
                        </div>
                    </div>
                </div>


                {/* ==============================
                    BACK FACE (HOMEWORK) 
                   ============================== */}
                <div className="back-face absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-700">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
                         <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#38BDF8] flex items-center gap-2">
                                <PlayCircle size={20}/> Homework
                            </h3>
                            <span className="text-xs font-mono text-gray-500">{homework.length} TASKS</span>
                         </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {homework.length > 0 ? homework.map((hw, i) => (
                            <div key={i} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-[#38BDF8] transition-all group/item">
                                <div className="mb-3">
                                    <p className="text-sm font-bold text-white uppercase tracking-wide font-mono">{hw.title}</p>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{hw.desc || "Complete this drill to improve your rating."}</p>
                                </div>
                                <a 
                                    href={getVideoLink(hw.title)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()} 
                                    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition"
                                >
                                    <PlayCircle size={14} /> Watch Tutorial
                                </a>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                <BarChart3 size={40} className="opacity-20"/>
                                <span className="text-xs">No active homework</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-center">
                         <p className="text-xs text-gray-500 flex items-center gap-2">
                            <RotateCw size={12}/> Tap card to view profile
                         </p>
                    </div>
                </div>

            </div>
        </div>

        {/* === ACTION BUTTONS === */}
        <div className="flex gap-3 w-full max-w-[400px]">
            <button 
                onClick={() => handleDownload('png')} 
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white border border-gray-700 text-xs font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
                {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
                PNG
            </button>
            <button 
                onClick={() => handleDownload('pdf')} 
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white border border-gray-700 text-xs font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
                {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
                PDF
            </button>
        </div>

    </div>
  );
};

export default CometFlipCard;