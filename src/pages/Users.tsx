import { Bell, Home, Menu, Plus, Search, User, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useState } from "react";
import BottomNav from "@/components/navigation/BottomNav";

type UserStatus = "online" | "offline";

interface UserItem {
  id: string;
  name: string;
  role: string;
  status: UserStatus;
  avatarUrl: string;
}

const users: UserItem[] = [
  { id: "1", name: "Sarah Johnson", role: "Client", status: "online", avatarUrl: "/lovable-uploads/17b6fc9f-5711-4855-ab25-41649bdfa461.png" },
  { id: "2", name: "Michael Chen", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
  { id: "3", name: "Emily Davis", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
  { id: "4", name: "James Wilson", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
  { id: "5", name: "Lisa Anderson", role: "Client", status: "offline", avatarUrl: "/placeholder.svg" },
  { id: "6", name: "David Kim", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
  { id: "7", name: "Rachel Brown", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
  { id: "8", name: "Thomas Moore", role: "Client", status: "online", avatarUrl: "/placeholder.svg" },
];

const FilterButton = ({ label, isActive = false }: { label: string; isActive?: boolean }) => (
  <button
    className={`px-4 py-1.5 rounded-full text-sm ${
      isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const UserCard = ({ user }: { user: UserItem }) => (
  <Link to={`/users/${user.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          user.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{user.name}</h3>
        <p className="text-gray-500 text-sm">{user.role}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </Link>
);

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <div className="flex-1">
        <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
          <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Menu className="w-6 h-6 text-gray-500" />
                <h1 className="text-2xl font-bold">Users</h1>
              </div>
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <FilterButton label="All" isActive={activeFilter === "All"} />
              <FilterButton label="Active" />
              <FilterButton label="Offline" />
              <FilterButton label="New" />
            </div>
          </header>

          <main className="px-6">
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Users;
