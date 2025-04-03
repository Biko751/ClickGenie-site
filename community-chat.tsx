import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useWebSocket } from "@/hooks/use-websocket";
import { timeAgo } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Search,
  Smile,
  Paperclip,
  Send,
  UserCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  channel: string;
  content: string;
  createdAt: string;
}

interface ChatChannel {
  id: string;
  name: string;
  displayName: string;
}

export default function CommunityChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [currentChannel, setCurrentChannel] = useState("general");
  const [channelSearch, setChannelSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, sendMessage, getMessagesByType } = useWebSocket();

  // Available channels
  const channels: ChatChannel[] = [
    { id: "general", name: "general", displayName: "# general" },
    { id: "cpa-strategies", name: "cpa-strategies", displayName: "# cpa-strategies" },
    { id: "landing-pages", name: "landing-pages", displayName: "# landing-pages" },
    { id: "traffic-sources", name: "traffic-sources", displayName: "# traffic-sources" },
    { id: "newbie-help", name: "newbie-help", displayName: "# newbie-help" },
    { id: "success-stories", name: "success-stories", displayName: "# success-stories" },
    { id: "offers-discussion", name: "offers-discussion", displayName: "# offers-discussion" },
  ];
  
  // Filter channels based on search term
  const filteredChannels = channels.filter(
    (channel) => channel.name.includes(channelSearch.toLowerCase())
  );

  // Fetch chat history for the current channel
  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ["/api/chat", currentChannel],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${currentChannel}`);
      if (!response.ok) throw new Error("Failed to fetch chat messages");
      return response.json();
    },
  });

  // Get websocket messages
  const wsMessages = getMessagesByType("chat").filter(
    (msg) => msg.message.channel === currentChannel
  );

  // Combine chat history with websocket messages
  const allMessages = [...(chatHistory || [])];
  
  // Add websocket messages that aren't already in the history
  wsMessages.forEach((msg) => {
    const exists = allMessages.some((m) => m.id === msg.message.id);
    if (!exists) {
      allMessages.push(msg.message);
    }
  });

  // Sort messages by creation time
  allMessages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Send a new message
  const handleSendMessage = () => {
    if (!message.trim() || !isConnected || !user) return;
    
    const success = sendMessage({
      type: "chat",
      channelId: currentChannel,
      content: message.trim(),
    });
    
    if (success) {
      setMessage("");
    } else {
      toast({
        title: "Connection Issue",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate avatar initials
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Generate random color for user avatar based on username
  const getUserColor = (username: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    
    // Use a hash function to consistently get the same color for the same username
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % colors.length;
    
    return colors[colorIndex];
  };

  // Static online members for UI display
  const onlineMembers = [
    { username: "TrafficKing", initial: "T" },
    { username: "CPAmaster", initial: "C" },
    { username: "MarketingPro", initial: "M" },
    { username: "AffiliateQueen", initial: "A" },
  ];

  return (
    <Card className="h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          Community Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-4 h-full">
          {/* Chat Channels */}
          <div className="md:col-span-1 border-r border-gray-200 p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search channels..."
                  className="pl-10 text-sm"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1 mb-6">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`rounded-md p-2 flex items-center cursor-pointer ${
                    currentChannel === channel.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentChannel(channel.id)}
                >
                  <span 
                    className={`w-2 h-2 rounded-full mr-2 ${
                      currentChannel === channel.id ? "bg-primary" : "bg-gray-300"
                    }`}
                  ></span>
                  <span className={currentChannel === channel.id ? "font-medium" : ""}>
                    {channel.displayName}
                  </span>
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-600 text-sm mb-2">Online Members</h3>
              <div className="space-y-2">
                {onlineMembers.map((member) => (
                  <div key={member.username} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full ${getUserColor(member.username)} flex items-center justify-center mr-2 relative`}
                    >
                      <span>{member.initial}</span>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-sm">{member.username}</span>
                  </div>
                ))}
                {user && (
                  <div className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full ${getUserColor(user.username)} flex items-center justify-center mr-2 relative`}
                    >
                      <span>{getInitials(user.username)}</span>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-sm">{user.username}</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">You</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="md:col-span-3 flex flex-col h-full">
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-bold text-lg">
                {filteredChannels.find(c => c.id === currentChannel)?.displayName || "# " + currentChannel}
              </h3>
              <p className="text-sm text-gray-600">
                {currentChannel === "general" 
                  ? "General discussion for all ClickGenie members" 
                  : `Discussion about ${currentChannel.replace("-", " ")}`}
              </p>
            </div>
            
            {/* Messages Area */}
            <ScrollArea className="flex-grow p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : allMessages && allMessages.length > 0 ? (
                <div className="space-y-4">
                  {allMessages.map((message: ChatMessage) => (
                    <div key={message.id} className="flex">
                      <div 
                        className={`w-10 h-10 rounded-full ${getUserColor(message.username)} flex items-center justify-center mr-3 flex-shrink-0`}
                      >
                        <span>{getInitials(message.username)}</span>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium mr-2">{message.username}</span>
                          <span className="text-xs text-gray-500">{timeAgo(message.createdAt)}</span>
                        </div>
                        <p className="text-gray-800">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <UserCircle className="h-12 w-12 mb-2" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Be the first to start the conversation!</p>
                </div>
              )}
            </ScrollArea>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="relative">
                <Textarea
                  placeholder="Type your message here..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none pr-20"
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    type="button" 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  disabled={!message.trim() || !isConnected}
                  onClick={handleSendMessage}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
              {!isConnected && (
                <p className="text-sm text-red-500 mt-1">
                  Not connected to chat server. Please refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
