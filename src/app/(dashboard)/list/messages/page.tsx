import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getGlobalChat, getChatMessages } from "@/lib/actions";
import ChatInterface from "@/components/ChatInterface";

export default async function MessagesPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // 1. Safe Username & Email Extraction
  const emailStr = clerkUser.emailAddresses?.[0]?.emailAddress;
  let currentUsername = clerkUser.username;
  
  if (!currentUsername) {
     if (emailStr) {
        currentUsername = emailStr.split('@')[0];
     } else {
        currentUsername = `user${clerkUser.id.slice(0, 5)}`;
     }
  }

  // 2. Find User in DB
  let dbUser = await prisma.user.findUnique({ where: { userCode: currentUsername } });

  // =========================================================
  // 🔥 AUTO-FIX: If name is "User", change it to "Admin"
  // =========================================================
  if (dbUser && dbUser.name === "User") {
    console.log("Renaming 'User' to 'Admin'...");
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { name: "Admin" } // <--- Updates your name instantly
    });
  }

  // 3. Create User if missing
  if (!dbUser) {
     const safeEmail = emailStr || `no-email-${clerkUser.id}@example.com`;
     
     // Determine name: Use Clerk name OR default to "Admin"
     const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
     const finalName = fullName || "Admin"; // <--- Default is now Admin

     try {
        dbUser = await prisma.user.create({
          data: {
            userCode: currentUsername,
            username: currentUsername,
            name: finalName,
            email: safeEmail, 
            photo: clerkUser.imageUrl,
            role: "ADMIN", // Force Admin role
          },
        });
     } catch (err) {
        console.error("Error creating user:", err);
        return <div className="p-4 text-red-500">Error: Could not sync user profile.</div>;
     }
  }

  // 4. Load Chat
  const globalChat = await getGlobalChat(dbUser.id);
  const messages = await getChatMessages(globalChat.id);

  return (
    <div className="h-[calc(100vh-4rem)] p-4 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Community Chat</h1>
      <ChatInterface 
        currentUser={dbUser} 
        conversationId={globalChat.id} 
        initialMessages={messages}
      />
    </div>
  );
}