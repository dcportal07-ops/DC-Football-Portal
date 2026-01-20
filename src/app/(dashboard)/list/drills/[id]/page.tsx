import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
    Activity,
    Users,
    Clock,
    Hash,
    TrendingUp,
    TrendingDown,
    PlayCircle,
    Layers,
    FileText,
    Video
} from "lucide-react";
import FormModal from "@/components/FormModal";
// Import Charts
import { DrillRadarChart } from "@/components/DrillCharts";
import AssignDrillButton from "@/components/AssignDrillButton";

const CARD_STYLE = "bg-white p-6 rounded-xl shadow-sm border border-gray-100";

const SingleDrillPage = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    // 1. FETCH DRILL DATA
    const drill = await prisma.drill.findUnique({
        where: { id },
    });

    if (!drill) return notFound();

    // 2. PREPARE DATA
    // Since we don't have explicit "intensity ratings" in the Drill model yet, 
    // we simulate them based on difficulty level for the chart.
    const baseScore = drill.level === "Advanced" ? 90 : drill.level === "Intermediate" ? 60 : 30;

    const drillAttributes = [
        { subject: "Technical", A: drill.category === "Technical" ? 90 : 50, fullMark: 100 },
        { subject: "Physical", A: drill.category === "Physical" ? 90 : 60, fullMark: 100 },
        { subject: "Tactical", A: drill.category === "Tactical" ? 90 : 40, fullMark: 100 },
        { subject: "Mental", A: drill.category === "Mental" ? 90 : 50, fullMark: 100 },
        { subject: "Complexity", A: baseScore, fullMark: 100 },
    ];

    const coachProfile = await prisma.coachProfile.findUnique({ where: { userId: user?.id } });
    const currentCoachId = coachProfile?.id || "";

    return (
        <div className="flex-1 p-4 flex flex-col xl:flex-row gap-6">

            {/* --- LEFT SECTION (2/3) --- */}
            <div className="w-full xl:w-2/3 flex flex-col gap-6">

                {/* HEADER & VIDEO CARD */}
                <div className={CARD_STYLE}>
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-800">{drill.name}</h1>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
                                    {drill.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><Hash size={14} /> {drill.code}</span>
                                <span className="flex items-center gap-1 text-orange-600"><Activity size={14} /> {drill.level}</span>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {role === "admin" && (
                            <div className="flex gap-2">
                                <FormModal table="drills" type="update" data={drill} />
                                <FormModal table="drills" type="delete" id={drill.id} />
                            </div>
                        )}
                    </div>

                    {/* Video Player Placeholder */}
                    <div className="w-full h-[350px] bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer border border-gray-200 shadow-inner">
                        {drill.videoUrl ? (
                            // If you have a real video URL or Thumbnail
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <a href={drill.videoUrl} target="_blank" className="flex flex-col items-center text-white hover:text-teal-400 transition">
                                    <PlayCircle size={64} className="mb-2" />
                                    <span className="font-semibold text-lg">Click to Watch Video</span>
                                </a>
                            </div>
                        ) : (
                            // Fallback
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <div className="bg-white/10 p-4 rounded-full mb-2"><Video size={32} /></div>
                                <span className="font-semibold text-sm tracking-wide">No Video Available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DESCRIPTION CARD */}
                <div className={CARD_STYLE}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <div className="p-2 bg-teal-100 rounded-md text-teal-700">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-700">Description & Instructions</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                        {drill.description}
                    </p>
                </div>

                {/* COACHING POINTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Regression */}
                    <div className={`${CARD_STYLE} border-l-4 border-l-green-500`}>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown size={20} className="text-green-600" />
                            <h3 className="font-bold text-gray-700">Regression (Easier)</h3>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                            "{drill.regressionTip || "Reduce speed or remove ball to simplify."}"
                        </p>
                    </div>

                    {/* Progression */}
                    <div className={`${CARD_STYLE} border-l-4 border-l-orange-500`}>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={20} className="text-orange-600" />
                            <h3 className="font-bold text-gray-700">Progression (Harder)</h3>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                            "{drill.progressionTip || "Increase speed or add a defender."}"
                        </p>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SECTION (1/3) --- */}
            <div className="w-full xl:w-1/3 flex flex-col gap-6">

                {/* QUICK STATS */}
                <div className={CARD_STYLE}>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Drill Constraints</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Age Group</span>
                            </div>
                            <span className="font-bold text-gray-800">{drill.minAge} - {drill.maxAge} Yrs</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Duration</span>
                            </div>
                            <span className="font-bold text-gray-800">~15 Mins</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Layers size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Difficulty</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${drill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : drill.level === 'Advanced' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {drill.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SKILLS TAGS */}
                <div className={CARD_STYLE}>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Primary Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {drill.primarySkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* INTENSITY CHART (RADAR) */}
                <DrillRadarChart data={drillAttributes} />

                {/* ACTIONS */}
                <div className={CARD_STYLE}>
                    <h2 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h2>
                    <div className="flex flex-col gap-2">
                        <AssignDrillButton
                            drillId={drill.id}
                            drillName={drill.name}
                            coachId={currentCoachId}
                        />
                        <button className="p-3 bg-orange-50 rounded-md text-xs text-orange-600 hover:bg-orange-100 flex items-center justify-between group transition-colors text-left w-full">
                            <span>Add to Favorites</span>
                            <span className="text-orange-400 group-hover:text-orange-600 font-bold">★</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SingleDrillPage;