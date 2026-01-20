"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  Calendar,
  User,
  Target,
  Clock,
  CheckCircle,
  FileText,
  Video,
  Download,
  Dumbbell,
  Loader2
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import FormModal from "@/components/FormModal";

// Colors
const TEAL = "#006D77";
const CARD_STYLE = "bg-white p-6 rounded-xl shadow-sm border border-gray-100";

// --- PROPS INTERFACE ---
interface AssignmentViewProps {
  assignment: any; // Using any for flexibility with JSON fields
  role: string;
}

const AssignmentView = ({ assignment, role }: AssignmentViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Chart Data
  const progressData = [
    { name: "Current", score: assignment.currentRating, fill: "#94A3B8" },
    { name: "Goal", score: assignment.goalRating, fill: TEAL },
  ];

  // Helper: Format Date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async (type: 'png' | 'pdf') => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, { useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      if (type === 'png') {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${assignment.player.name}_Assignment.png`;
        link.click();
      } else {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${assignment.player.name}_Assignment.pdf`);
      }
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-6">
      
      {/* LEFT SECTION (Print Area) */}
      <div ref={printRef} className="w-full xl:w-2/3 flex flex-col gap-6 bg-gray-50 p-4 rounded-xl">
        
        {/* HEADER */}
        <div className={CARD_STYLE}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{assignment.template}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
                        assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                        {assignment.status}
                    </span>
                 </div>
                 <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Target size={14} className="text-blue-500"/> Focus: {assignment.skillFocus}</span>
                    <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400"/> {assignment.estimatedTimeMin} Mins</span>
                 </div>
              </div>

              {/* Admin Actions (Hide in print) */}
              {role === "admin" && (
                <div className="flex gap-2" data-html2canvas-ignore> 
                  <FormModal table="homework" type="update" data={assignment} />
                  <FormModal table="homework" type="delete" id={assignment.id} />
                </div>
              )}
           </div>

           <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
              <FileText size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                  <h3 className="text-sm font-bold text-blue-800 mb-1">Coach Feedback</h3>
                  <p className="text-sm text-blue-700 italic leading-relaxed">"{assignment.coachFeedback || "No feedback provided."}"</p>
              </div>
           </div>
        </div>

        {/* CHART */}
        <div className={`${CARD_STYLE} h-[250px]`}>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-700">Skill Progression</h2>
                <span className="text-xs text-gray-400">Target Rating</span>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={progressData} layout="vertical" barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{fontSize: 12, fontWeight: 600}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px'}} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        <Cell fill="#94A3B8" /> 
                        <Cell fill={TEAL} />    
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* DRILL LIST */}
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-700">Assigned Drills</h2>
            {/* Safe check for array */}
            {Array.isArray(assignment.drillItems) && assignment.drillItems.map((drill: any, index: number) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
                    <div className="bg-gray-100 w-full md:w-16 flex items-center justify-center font-bold text-xl text-gray-400 border-r border-gray-200 py-2 md:py-0">
                        {index + 1}
                    </div>
                    <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">{drill.title || drill.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{drill.desc || drill.description}</p>
                        
                        <div className="flex items-center gap-3">
                            {drill.videoUrl && (
                                <a href={drill.videoUrl} target="_blank" className="ml-auto text-xs flex items-center gap-1 text-blue-600 font-medium hover:underline">
                                    <Video size={14} /> Watch Demo
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        
        {/* PLAYER INFO */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Assigned To</h2>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden border border-gray-200">
                    <Image src={assignment.player.user.photo || "/noAvatar.png"} alt="Player" fill className="object-cover" />
                </div>
                <div>
                    <Link href={`/list/players/${assignment.playerId}`} className="font-bold text-gray-800 hover:text-blue-600 block">
                        {assignment.player.user.name}
                    </Link>
                    <span className="text-xs text-gray-500">ID: {assignment.player.id}</span>
                </div>
            </div>
        </div>

        {/* DETAILS */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Details</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium text-gray-700">Assigned</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{formatDate(assignment.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium text-gray-700">Coach</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{assignment.coach.user.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Dumbbell size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium text-gray-700">Drills</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{Array.isArray(assignment.drillItems) ? assignment.drillItems.length : 0} Exercises</span>
                </div>
            </div>
        </div>

        {/* ACTIONS */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
                <button className="p-3 bg-green-50 rounded-md text-xs text-green-700 hover:bg-green-100 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>Mark as Completed</span>
                    </div>
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownload('pdf')} disabled={downloading} className="p-3 bg-gray-50 rounded-md text-xs text-gray-600 hover:bg-gray-100 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50">
                        {downloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                        <span>PDF</span>
                    </button>
                    <button onClick={() => handleDownload('png')} disabled={downloading} className="p-3 bg-gray-50 rounded-md text-xs text-gray-600 hover:bg-gray-100 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50">
                        {downloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                        <span>Image</span>
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AssignmentView;