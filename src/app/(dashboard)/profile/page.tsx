import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CoachView from "@/components/views/CoachView"; // Check import path
import PlayerView from "@/components/views/PlayerView"; // Check import path

const ProfilePage = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const role = user.publicMetadata.role as string;
  const currentUserId = user.id;

  // 1. ADMIN PROFILE
  if (role === "admin") {
    return (
      <div className="flex-1 p-4 flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
            <p className="text-gray-500 mt-2">You are the Super Admin.</p>
            <div className="mt-4 text-xs bg-gray-100 py-2 rounded">
                {user.emailAddresses[0]?.emailAddress}
            </div>
        </div>
      </div>
    );
  }

  // 2. COACH PROFILE
  if (role === "coach") {
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: currentUserId },
      select: { id: true }
    });

    if (!coachProfile) return <div className="p-6 text-center text-gray-500">Coach Profile Not Found. Please contact admin.</div>;
    
    // 🔥 INSTAGRAM FEEL: Show My Coach Dashboard
    return <CoachView coachId={coachProfile.id} />;
  }

  // 3. PLAYER PROFILE
  if (role === "player") {
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: currentUserId },
      select: { id: true }
    });

    if (!playerProfile) return <div className="p-6 text-center text-gray-500">Player Profile Not Found. Please contact admin.</div>;

    // 🔥 INSTAGRAM FEEL: Show My Player Dashboard
    return <PlayerView playerId={playerProfile.id} />;
  }

  return <div className="p-6 text-center text-gray-500">Role not recognized.</div>;
};

export default ProfilePage;