import React from "react";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import AssignmentView from "@/components/AssignmentView"; // Client Component
import { getVideoLink } from "@/lib/drills"; // Helper to generate video links

const SingleAssignmentPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 1. FETCH DATA FROM DB
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      player: {
        include: { user: true } // Need player name & photo
      },
      coach: {
        include: { user: true } // Need coach name
      }
    }
  });

  if (!assignment) return notFound();

  // 2. TRANSFORM DATA
  // Assignment table mein "drillItems" JSON format mein hai.
  // Hume usme "videoUrl" add karna padega taaki UI par video link dikhe.
  
  let enrichedDrills: any[] = [];
  
  if (assignment.drillItems && Array.isArray(assignment.drillItems)) {
    enrichedDrills = assignment.drillItems.map((drill: any) => ({
        ...drill,
        // Title ke basis par YouTube link generate karo
        videoUrl: getVideoLink(drill.title || drill.name) 
    }));
  }

  // 3. PASS TO CLIENT COMPONENT
  // Clone object to add the enriched drills
  const formattedAssignment = {
      ...assignment,
      drillItems: enrichedDrills
  };

  return <AssignmentView assignment={formattedAssignment} role={role} />;
};

export default SingleAssignmentPage;