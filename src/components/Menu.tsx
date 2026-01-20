import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs"; // ✅ Import Clerk Button

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Home", href: "/admin", visible: ["admin"] },
      { icon: "/home.png", label: "Home", href: "/coach", visible: ["coach"] },
      { icon: "/home.png", label: "Home", href: "/player", visible: ["player"] },
      { icon: "/teacher.png", label: "Coach", href: "/list/coaches", visible: ["admin"] },
      { icon: "/student.png", label: "Players", href: "/list/players", visible: ["admin", "coach"] },
      { icon: "/subject.png", label: "Teams", href: "/list/teams", visible: ["admin", "coach"] },
       { icon: "/football-club.png", label: "Club", href: "/list/club", visible: ["admin", "coach"] },
      { icon: "/class.png", label: "Evaluations", href: "/list/evaluations", visible: ["admin", "coach"] },
      { icon: "/exam.png", label: "Drill Library", href: "/list/drills", visible: ["admin", "coach"] },
      { icon: "/assignment.png", label: "Homework", href: "/list/homework", visible: ["admin", "coach", "player"] },
      { icon: "/calendar.png", label: "Events", href: "/list/stats", visible: ["admin", "coach", "player"] },
      { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "coach", "player"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "coach", "player"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "coach", "player"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "coach", "player"] },
      { icon: "/logout.png", label: "Logout", href: "#", visible: ["admin", "coach", "player"] },
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  if (!role) return null;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <span className="hidden lg:block text-gray-400 font-light my-5">
            {section.title}
          </span>

          {section.items
            .filter((item) => item.visible.includes(role))
            .map((item) => {
                
              // ✅ SPECIAL CASE: LOGOUT BUTTON
              if (item.label === "Logout") {
                return (
                  <SignOutButton key={item.label}>
                    <button className="flex items-center justify-center lg:justify-start gap-4 md:px-2 text-gray-500 rounded-md hover:bg-blue-50 py-2 w-full">
                      <Image src={item.icon} alt={item.label} width={20} height={20} />
                      <span className="hidden lg:block">{item.label}</span>
                    </button>
                  </SignOutButton>
                );
              }

              // ✅ STANDARD LINK
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-center lg:justify-start gap-4 md:px-2 text-gray-500 rounded-md hover:bg-blue-50 py-2"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
        </div>
      ))}
    </div>
  );
};

export default Menu;