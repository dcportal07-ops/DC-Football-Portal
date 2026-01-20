import { UserProfile } from "@clerk/nextjs";

const SettingsPage = () => {
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 h-[calc(100vh-120px)] overflow-y-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h1>
      
      {/* Centered Clerk Component */}
      <div className="flex justify-center">
        <UserProfile 
          routing="hash" 
          appearance={{
            elements: {
              rootBox: "w-full shadow-none",
              card: "shadow-none border border-gray-200 w-full max-w-4xl",
              navbar: "hidden md:flex", // Hide on mobile if needed
            }
          }}
        />
      </div>
    </div>
  );
};

export default SettingsPage;