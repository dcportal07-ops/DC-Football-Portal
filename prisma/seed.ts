// import {
//   PrismaClient,
//   Role,
//   Gender,
//   AssignmentStatus,
// } from "@/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log("🌱 Seeding database...");

//   /* ================= USERS ================= */

//   const admin = await prisma.user.create({
//     data: {
//       userCode: "admin_001",
//       name: "Rohit Sharma",
//       email: "rohit.admin@dcway.com",
//       phone: "9876543212",
//       photo: "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg",
//       role: Role.ADMIN,
//     },
//   });

//   const coachUser1 = await prisma.user.create({
//     data: {
//       userCode: "coach_001",
//       name: "Arjun Patel",
//       email: "arjun.patel@dcway.com",
//       phone: "9876543210",
//       photo: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg",
//       role: Role.COACH,
//     },
//   });

//   const coachUser2 = await prisma.user.create({
//     data: {
//       userCode: "coach_002",
//       name: "Simran Kaur",
//       email: "simran.kaur@dcway.com",
//       phone: "9876543211",
//       photo: "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg",
//       role: Role.COACH,
//     },
//   });

//   /* ================= COACH PROFILES ================= */

//   const coach1 = await prisma.coachProfile.create({
//     data: { userId: coachUser1.id },
//   });

//   const coach2 = await prisma.coachProfile.create({
//     data: { userId: coachUser2.id },
//   });

//   /* ================= TEAMS ================= */

//   const teamU14 = await prisma.team.create({
//     data: {
//       code: "U14_TIGERS",
//       name: "U14 Tigers",
//       ageGroup: "11-14",
//     },
//   });

//   const teamU12 = await prisma.team.create({
//     data: {
//       code: "U12_GOLD",
//       name: "U12 Gold",
//       ageGroup: "9-12",
//     },
//   });

//   /* ================= COACH ↔ TEAM ================= */

//   await prisma.coachTeam.createMany({
//     data: [
//       { coachId: coach1.id, teamId: teamU14.id },
//       { coachId: coach2.id, teamId: teamU12.id },
//     ],
//   });

//   /* ================= PLAYER USERS ================= */

//   const leoUser = await prisma.user.create({
//     data: {
//       userCode: "player_leo_001",
//       name: "Leo Anderson",
//       email: "parent.leo@family.com",
//       role: Role.PLAYER,
//     },
//   });

//   const masonUser = await prisma.user.create({
//     data: {
//       userCode: "player_mason_002",
//       name: "Mason Rivera",
//       email: "mason.parent@family.com",
//       role: Role.PLAYER,
//     },
//   });

//   /* ================= PLAYER PROFILES ================= */

//   const leo = await prisma.playerProfile.create({
//     data: {
//       userId: leoUser.id,
//       dob: new Date("2013-05-04"),
//       gender: Gender.M,
//       jerseyNumber: 17,
//       parentEmail: "parent.leo@family.com",
//       address: "123 Main St",
//       teamId: teamU14.id,
//     },
//   });

//   const mason = await prisma.playerProfile.create({
//     data: {
//       userId: masonUser.id,
//       dob: new Date("2015-04-12"),
//       gender: Gender.M,
//       jerseyNumber: 9,
//       parentEmail: "mason.parent@family.com",
//       address: "123 Main St",
//       teamId: teamU12.id,
//     },
//   });

//   /* ================= DRILLS ================= */

//   await prisma.drill.createMany({
//     data: [
//       {
//         code: "TEC_006",
//         name: "V-Cut (Inside)",
//         category: "Technical",
//         level: "Intermediate",
//         primarySkills: ["Dribbling", "Ball Control"],
//         minAge: 5,
//         maxAge: 99,
//         description: "Pull back and push diagonally using inside foot.",
//       },
//       {
//         code: "PHY_009",
//         name: "Wall Acceleration",
//         category: "Physical",
//         level: "Advanced",
//         primarySkills: ["Speed", "Acceleration"],
//         minAge: 12,
//         maxAge: 99,
//         description: "Explosive acceleration drill.",
//       },
//     ],
//   });

//   /* ================= EVALUATION ================= */

//   await prisma.evaluation.create({
//     data: {
//       playerId: leo.id,
//       coachId: coach1.id,
//       ratingsJson: {
//         technical: { Dribbling: 4 },
//         physical: { Speed: 8 },
//       },
//       overallJson: {
//         technical: 4,
//         physical: 8,
//       },
//       note: "Initial baseline evaluation.",
//     },
//   });

//   /* ================= ASSIGNMENT ================= */

//   await prisma.assignment.create({
//     data: {
//       playerId: leo.id,
//       coachId: coach1.id,
//       template: "Dribbling Progress Plan",
//       skillFocus: "Dribbling",
//       currentRating: 4,
//       goalRating: 8,
//       drillItems: [
//         { code: "TEC_006", sets: "3", reps: "10" },
//         { code: "PHY_009", sets: "4", reps: "20m sprints" },
//       ],
//       estimatedTimeMin: 30,
//       status: AssignmentStatus.PENDING,
//       exportFormats: ["pdf"],
//     },
//   });

//   /* ================= EVENT ================= */

//   await prisma.event.create({
//     data: {
//       title: "U14 Tigers Training",
//       startTime: new Date("2025-02-03T17:00:00"),
//       endTime: new Date("2025-02-03T18:30:00"),
//       teamId: teamU14.id,
//     },
//   });

//   /* ================= ANNOUNCEMENT ================= */

//   await prisma.announcement.create({
//     data: {
//       title: "Winter Training Schedule Released",
//       audience: "All",
//       date: new Date("2025-11-20"),
//     },
//   });


//   /* ================= FLIP CARD ================= */

// await prisma.flipCard.create({
//   data: {
//     title: "Week 1 Player Smart Card",

//     content: {
//       overallScore: 8.6,

//       strengths: [
//         "Dribbling",
//         "Speed",
//         "Ball Control"
//       ],

//       weaknesses: [
//         "Weak Foot",
//         "Communication"
//       ],

//       homework: [
//         {
//           title: "Wall Passing (Left Foot)",
//           sets: "3",
//           reps: "50",
//         },
//         {
//           title: "Match Analysis",
//           notes: "Observe positioning and communication",
//         }
//       ],

//       coachNotes: "Excellent pace improvement this week",
//     },

//     coachId: coach1.id,
//     playerId: leo.id,
//   },
// });


//   console.log("✅ Seed completed successfully");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Seed failed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
