
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  userProfile: any;
}

const DashboardHeader = ({ userProfile }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-center justify-between">
      <div className="flex items-center">
        <img
          src="/lovable-uploads/a18ff71a-0b3e-4795-a638-dd589a1a82ee.png"
          alt="WiseBite"
          className="h-6 w-auto mr-2"
        />
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <div className="flex items-center">
        <Link to="/notifications">
          <div className="relative mr-4">
            <Bell className="h-6 w-6 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
          </div>
        </Link>
        <Link to="/account">
          <Avatar className="h-8 w-8">
            {userProfile?.avatar ? (
              <AvatarImage src={userProfile.avatar} />
            ) : null}
            <AvatarFallback className="bg-emerald-100 text-emerald-800">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
