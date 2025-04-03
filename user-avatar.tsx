import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Smile, UserCheck, Award, Crown } from "lucide-react";

const AVATAR_ANIMATIONS = [
  "animate-bounce",
  "animate-pulse",
  "animate-spin",
  "hover:scale-110 transition-transform"
];

const AVATAR_ICONS = [
  <UserCircle className="h-8 w-8 text-primary" />,
  <Smile className="h-8 w-8 text-green-500" />,
  <UserCheck className="h-8 w-8 text-blue-500" />,
  <Award className="h-8 w-8 text-purple-500" />,
  <Crown className="h-8 w-8 text-yellow-500" />
];

export default function UserAvatar({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const { user } = useAuth();
  const [avatarIcon, setAvatarIcon] = useState(0);
  const [animation, setAnimation] = useState(0);
  
  // Get a deterministic avatar based on user ID
  useEffect(() => {
    if (user?.id) {
      // Create consistent avatar based on user ID
      const iconIndex = user.id % AVATAR_ICONS.length;
      const animIndex = Math.floor(user.id / 10) % AVATAR_ANIMATIONS.length;
      setAvatarIcon(iconIndex);
      setAnimation(animIndex);
    }
  }, [user?.id]);
  
  if (!user) return null;
  
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  const getSize = () => {
    switch (size) {
      case "sm": return "h-8 w-8";
      case "md": return "h-12 w-12";
      case "lg": return "h-20 w-20";
      default: return "h-12 w-12";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <Avatar className={`${getSize()} ${AVATAR_ANIMATIONS[animation]} bg-primary/20`}>
        <AvatarFallback className="text-primary bg-primary/10">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-2 flex justify-center">
        {AVATAR_ICONS[avatarIcon]}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {user.balance > 100 ? "VIP Member" : "Member"}
      </p>
    </div>
  );
}