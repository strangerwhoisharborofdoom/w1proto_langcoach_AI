import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Flame, Zap, Medal, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  xp: number;
  streak: number;
  level: number;
}

export default function StudentLeaderboard() {
  const { user } = useAuth();
  
  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, id: "1", name: "Emily Chen", xp: 3500, streak: 15, level: 8 },
    { rank: 2, id: "2", name: "Marcus Johnson", xp: 3200, streak: 12, level: 7 },
    { rank: 3, id: "3", name: "Sofia Rodriguez", xp: 2900, streak: 10, level: 7 },
    { rank: 4, id: "4", name: user?.fullName || "You", xp: 1250, streak: 7, level: 5 },
    { rank: 5, id: "5", name: "James Wilson", xp: 1100, streak: 6, level: 5 },
    { rank: 6, id: "6", name: "Olivia Brown", xp: 950, streak: 5, level: 4 },
    { rank: 7, id: "7", name: "Noah Davis", xp: 875, streak: 8, level: 4 },
    { rank: 8, id: "8", name: "Ava Martinez", xp: 720, streak: 4, level: 4 },
    { rank: 9, id: "9", name: "Liam Anderson", xp: 650, streak: 3, level: 3 },
    { rank: 10, id: "10", name: "Emma Taylor", xp: 580, streak: 5, level: 3 },
  ];

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-400";
      case 2:
        return "bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-400";
      case 3:
        return "bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-400";
      default:
        return "bg-white border";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-500" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return entry.name === user?.fullName || entry.rank === 4;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Leaderboard</h1>
        <p className="text-muted-foreground">Compete with fellow students and climb the ranks!</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {leaderboardData.slice(0, 3).map((entry, index) => {
          const order = index === 0 ? 1 : index === 1 ? 0 : 2; // Center the 1st place
          const colors = [
            { border: "border-yellow-400", bg: "bg-yellow-500", text: "text-yellow-600" },
            { border: "border-gray-400", bg: "bg-gray-500", text: "text-gray-600" },
            { border: "border-orange-400", bg: "bg-orange-500", text: "text-orange-600" },
          ];
          
          return (
            <Card 
              key={entry.id} 
              className={`${getRankStyle(entry.rank)} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 order-${order}`}
              style={{ order }}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className={`h-16 w-16 border-4 ${colors[index].border}`}>
                    <AvatarFallback className={`text-lg font-bold ${colors[index].text}`}>
                      {getInitials(entry.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-bold text-lg">{entry.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge className={`${colors[index].bg} hover:${colors[index].bg} text-white`}>
                        {entry.xp} XP
                      </Badge>
                      <Badge variant="outline" className="border-[#ff9600]">
                        <Flame className="h-3 w-3 mr-1 text-[#ff9600]" />
                        {entry.streak}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Level {entry.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#58cc02]" />
            Full Rankings
          </CardTitle>
          <CardDescription>See where you stand among all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  getRankStyle(entry.rank)
                } ${
                  isCurrentUser(entry)
                    ? "ring-2 ring-[#1cb0f6] shadow-lg scale-[1.02]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className={`h-10 w-10 ${entry.rank <= 3 ? "border-2" : ""} ${
                    entry.rank === 1 ? "border-yellow-400" : 
                    entry.rank === 2 ? "border-gray-400" : 
                    entry.rank === 3 ? "border-orange-400" : ""
                  }`}>
                    <AvatarFallback className={
                      entry.rank === 1 ? "text-yellow-600" :
                      entry.rank === 2 ? "text-gray-600" :
                      entry.rank === 3 ? "text-orange-600" :
                      ""
                    }>
                      {getInitials(entry.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isCurrentUser(entry) ? "text-[#1cb0f6]" : ""}`}>
                      {entry.name}
                      {isCurrentUser(entry) && (
                        <Badge className="ml-2 bg-[#1cb0f6] hover:bg-[#1cb0f6] text-white text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-[#58cc02] font-bold">
                      <Trophy className="h-4 w-4" />
                      {entry.xp} XP
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-[#ff9600] font-bold">
                      <Flame className="h-4 w-4" />
                      {entry.streak} days
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-[#1cb0f6] font-bold">
                      <Zap className="h-4 w-4" />
                      Lvl {entry.level}
                    </div>
                  </div>
                  
                  {/* Mobile view - compact */}
                  <div className="flex flex-col gap-1 sm:hidden">
                    <Badge className="bg-[#58cc02] hover:bg-[#58cc02] text-white text-xs">
                      {entry.xp} XP
                    </Badge>
                    <Badge variant="outline" className="border-[#ff9600] text-xs">
                      <Flame className="h-3 w-3 mr-1 text-[#ff9600]" />
                      {entry.streak}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
