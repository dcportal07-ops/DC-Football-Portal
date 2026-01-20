import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import FormModal from "@/components/FormModal";
import { Calendar, User, Swords, Shield } from "lucide-react";
import { EvaluationRadarChart, EvaluationSummaryChart } from "@/components/EvaluationCharts";

const TEAL = "#006D77";
const ORANGE = "#F97316";
const CARD_STYLE = "bg-white p-4 rounded-md shadow-sm border border-gray-100";

// ✅ FIXED: Transform Data to handle BOTH Objects and Single Numbers
const transformData = (input: any) => {
  // Case 1: Input is missing -> Empty
  if (!input) return [];

  // Case 2: Input is a Single Number (e.g., 7) -> Create a "Diamond" shape so Radar works
  if (typeof input === "number" || typeof input === "string") {
    let val = Number(input) || 0;
    if (val > 10) val = val / 10; // Auto-scale 70 -> 7
    
    return [
      { subject: "General", A: val, fullMark: 10 },
      { subject: "Ability", A: val, fullMark: 10 },
      { subject: "Consistency", A: val, fullMark: 10 },
    ];
  }

  // Case 3: Input is an Object (Detailed stats) -> Map keys to axes
  return Object.entries(input).map(([key, value]) => {
    let val = Number(value) || 0;
    if (val > 10) val = val / 10;
    
    return {
      subject: key, // e.g., "Dribbling"
      A: val,
      fullMark: 10,
    };
  });
};

// ✅ HELPER: Calculate Average & Scale
const calculateAverage = (obj: any) => {
  if (!obj) return 0;
  
  // Handle Single Number
  if (typeof obj === 'number') {
      return obj > 10 ? Number((obj / 10).toFixed(1)) : obj;
  }

  const values = Object.values(obj).map((v) => Number(v));
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  let avg = sum / values.length;

  if (avg > 10) avg = avg / 10; // Scale 0-10

  return Number(avg.toFixed(1));
};

const SingleEvaluationPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      player: { include: { user: true } },
      coach: { include: { user: true } },
    },
  });

  if (!evaluation) return notFound();

  // 2. PREPARE DATA
  // Use 'any' cast to access flexible JSON structure
  const ratings = (evaluation.ratingsJson as any) || {};
  const overall = (evaluation.overallJson as any) || {};

  // 3. TRANSFORM CHARTS (Now handles single numbers!)
  const technicalData = transformData(ratings.technical);
  const tacticalData = transformData(ratings.tactical);
  const physicalData = transformData(ratings.physical);
  const mentalData = transformData(ratings.mental);

  // 4. CALCULATE SCORES
  const getScaledScore = (val: any, ratingsObj: any) => {
      // If we have a direct score (from simple form)
      if (typeof ratingsObj === 'number') {
          return ratingsObj > 10 ? ratingsObj / 10 : ratingsObj;
      }
      // If we have stored overall score
      if (val !== undefined && val !== null) {
          let num = Number(val);
          return num > 10 ? num / 10 : num;
      }
      return calculateAverage(ratingsObj);
  };

  const techScore = getScaledScore(overall.technical, ratings.technical);
  const tactScore = getScaledScore(overall.tactical, ratings.tactical);
  const physScore = getScaledScore(overall.physical, ratings.physical);
  const mentScore = getScaledScore(overall.mental, ratings.mental);

  // 5. SUMMARY DATA
  const summaryData = [
    { name: "Tech", score: techScore, fill: "#3B82F6" },
    { name: "Tac", score: tactScore, fill: "#8B5CF6" },
    { name: "Phys", score: physScore, fill: ORANGE },
    { name: "Ment", score: mentScore, fill: TEAL },
  ];

  const avgScore = ((techScore + tactScore + physScore + mentScore) / 4).toFixed(1);
  
  // Attacking / Defending
  const attScore = getScaledScore(overall.attacking, ratings.attacking);
  const defScore = getScaledScore(overall.defending, ratings.defending);

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
      
      {/* LEFT SECTION (2/3) */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        
        {/* HEADER */}
        <div className={CARD_STYLE}>
           <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start flex-1">
                  <div className="w-24 h-24 relative flex-shrink-0">
                     <Image 
                        src={evaluation.player.user.photo || "/noAvatar.png"} 
                        alt="Player" 
                        fill 
                        className="rounded-full object-cover border-4 border-gray-100"
                     />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                         <h1 className="text-xl font-bold text-gray-500">Evaluation: <span className="text-black">{evaluation.player.user.name}</span></h1>
                         <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold border border-green-200">COMPLETED</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                        Evaluation Note: {evaluation.note || "No specific notes provided."}
                      </p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                           <Calendar size={14} className="text-teal-600"/>
                           <span>{new Date(evaluation.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <User size={14} className="text-orange-500"/>
                           <span>Evaluator: <strong>{evaluation.coach?.user?.name || "Unknown"}</strong></span>
                        </div>
                      </div>
                  </div>
              </div>

              {role === "admin" && (
                <div className="flex gap-2 self-end md:self-start">
                  <FormModal table="evaluations" type="update" data={evaluation} />
                  <FormModal table="evaluations" type="delete" id={evaluation.id} />
                </div>
              )}
           </div>
        </div>

        {/* CHART GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EvaluationRadarChart type="technical" score={techScore} data={technicalData} />
            <EvaluationRadarChart type="tactical" score={tactScore} data={tacticalData} />
            <EvaluationRadarChart type="physical" score={physScore} data={physicalData} />
            <EvaluationRadarChart type="mental" score={mentScore} data={mentalData} />
        </div>
      </div>

      {/* RIGHT SECTION (1/3) */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        
        {/* OVERALL SCORE */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-md shadow-lg text-white flex flex-col items-center justify-center gap-2">
            <h3 className="text-sm font-medium opacity-80 uppercase tracking-widest">Overall Rating</h3>
            <h1 className="text-5xl font-bold">{avgScore}</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Out of 10</span> 
        </div>

        {/* SUMMARY BAR CHART */}
        <EvaluationSummaryChart data={summaryData} />

        {/* ATTACKING / DEFENDING */}
        <div className="grid grid-cols-2 gap-4">
            <div className={`${CARD_STYLE} flex flex-col items-center justify-center gap-2 py-6`}>
                <Swords size={24} className="text-red-500" />
                <span className="text-xs text-gray-500 font-bold uppercase">Attacking</span>
                <span className="text-2xl font-bold text-gray-800">{attScore || "-"}</span>
            </div>
            <div className={`${CARD_STYLE} flex flex-col items-center justify-center gap-2 py-6`}>
                <Shield size={24} className="text-indigo-500" />
                <span className="text-xs text-gray-500 font-bold uppercase">Defending</span>
                <span className="text-2xl font-bold text-gray-800">{defScore || "-"}</span>
            </div>
        </div>

        {/* ACTIONS */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
                <Link href={`/list/players/${evaluation.playerId}`} className="p-3 bg-gray-50 rounded-md text-xs text-gray-600 hover:bg-gray-100 flex items-center justify-between group transition-colors">
                    <span>View Player Profile</span>
                    <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
                <Link href={`/list/evaluations`} className="p-3 bg-blue-50 rounded-md text-xs text-blue-600 hover:bg-blue-100 flex items-center justify-between group transition-colors">
                    <span>Back to All Evaluations</span>
                    <span className="text-blue-400 group-hover:text-blue-600">←</span>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SingleEvaluationPage;