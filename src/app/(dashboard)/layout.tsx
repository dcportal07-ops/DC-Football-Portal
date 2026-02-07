import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ForcePasswordReset from "@/components/ForcePasswordReset";

const inter = Inter({ subsets: ["latin"] });

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // 🔥 FETCH DATA FOR PASSWORD RESET CHECK
  const user = await currentUser();
  let forceReset = false;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { forcePasswordReset: true }
    });
    if (dbUser?.forcePasswordReset) {
      forceReset = true;
    }
  }

  return (
    <div className="h-screen flex">
      <ForcePasswordReset forceReset={forceReset} />

      {/* Left Sidebar */}
      <div className="w-1/6 md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 ">

        <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
          <Image
            src="/flogo.png"
            alt="logo"
            width={100}
            height={100}
            className="mb-2"
          />
          <span className="hidden lg:block">
            DCway Portal System
          </span>
        </Link>
        <Menu />
      </div>
      {/* Right Content */}
      <div className="w-5/6 md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
