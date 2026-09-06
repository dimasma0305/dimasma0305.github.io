"use client";

import portfolio from "@/lib/portfolio-data.json";
import { useState } from "react";
import {
  Trophy,
  Users,
  Award,
  ChevronDown,
  Star,
  Zap,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";

const achievements = portfolio.achievements.map((item) => ({ ...item, icon: item.title === "1st Place" ? <Trophy className="w-6 h-6 text-primary" /> : <Award className="w-6 h-6 text-muted-foreground" /> }));

const teams = portfolio.teams;

export function CTFSection() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(
    null,
  );

  const handleAchievementClick = (index: number) => {
    if (selectedAchievement === index) {
      setSelectedAchievement(null);
    } else {
      setSelectedAchievement(index);
    }
  };

  // Single-accent rarity ramp: opacity encodes tier (the label text already
  // names the tier, so colour is never the sole signal).
  const difficultyColors = {
    Legendary: "text-primary bg-primary/25",
    Epic: "text-primary bg-primary/20",
    Rare: "text-primary bg-primary/15",
    Uncommon: "text-primary bg-primary/10",
    Common: "text-muted-foreground bg-muted",
  };

  return (
    <section
      id="ctf"
      className="relative section-y overflow-x-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYgMzBoLTZsMyAxMHoiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTMwIDMwaC02bDMgMTB6Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 w-full px-4">
          <SectionHeader
            index="03"
            eyebrow="Competitions"
            title="CTF Achievements"
            subtitle="8 first-place and 20+ podium finishes, national and international."
          />

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold">
                  Achievement Board
                </h3>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {achievements.slice(0, 6).map((achievement, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAchievementClick(index)}
                    aria-expanded={selectedAchievement === index}
                    className="cursor-pointer w-full text-left rounded-lg transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Card
                      className={`glass-card relative overflow-hidden transition-all duration-300 ${selectedAchievement === index ? "border-primary/40 ring-1 ring-primary/30" : ""}`}
                    >
                      <CardHeader className="space-y-1 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="shrink-0">{achievement.icon}</div>
                            <CardTitle className="text-base sm:text-lg truncate">
                              {achievement.title}
                            </CardTitle>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${difficultyColors[achievement.difficulty as keyof typeof difficultyColors]} shrink-0 text-xs whitespace-nowrap`}
                          >
                            {achievement.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1 text-sm">
                          <div className="truncate">
                            <strong className="text-muted-foreground">
                              Event:
                            </strong>{" "}
                            {achievement.event}
                          </div>
                          <div className="truncate">
                            <strong className="text-muted-foreground">
                              Team:
                            </strong>{" "}
                            {achievement.team}
                          </div>
                        </div>

                        {selectedAchievement === index && (
                          <div className="pt-2 mt-2 border-t border-muted animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="space-y-1 text-sm">
                                <div className="truncate">
                                  <strong className="text-muted-foreground">
                                    Date:
                                  </strong>{" "}
                                  {achievement.date}
                                </div>
                                {achievement.issuer && (
                                  <div className="truncate">
                                    <strong className="text-muted-foreground">
                                      Issued by:
                                    </strong>{" "}
                                    {achievement.issuer}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 mt-2">
                                  <Zap className="w-3 h-3 text-primary" />
                                  <span className="text-primary text-xs">
                                    {achievement.points} XP
                                  </span>
                                </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <details className="group">
                  <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-primary hover:underline bg-primary/10 rounded-lg">
                    <span>View more achievements</span>
                    <span className="transition-transform group-open:rotate-180">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </summary>
                  <div className="grid gap-3 mt-4 grid-cols-1 sm:grid-cols-2 w-full">
                    {achievements.slice(6).map((achievement, index) => (
                      <Card
                        key={index + 6}
                        className="glass-card relative overflow-hidden transition-all duration-300"
                      >
                        <CardHeader className="space-y-1 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="shrink-0">{achievement.icon}</div>
                              <CardTitle className="text-base sm:text-lg truncate">
                                {achievement.title}
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${difficultyColors[achievement.difficulty as keyof typeof difficultyColors]} shrink-0 text-xs whitespace-nowrap`}
                            >
                              {achievement.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="space-y-1 text-sm">
                            <div className="truncate">
                              <strong className="text-muted-foreground">
                                Event:
                              </strong>{" "}
                              {achievement.event}
                            </div>
                            <div className="truncate">
                              <strong className="text-muted-foreground">
                                Team:
                              </strong>{" "}
                              {achievement.team}
                            </div>
                            <div className="truncate">
                              <strong className="text-muted-foreground">
                                Date:
                              </strong>{" "}
                              {achievement.date}
                            </div>
                            {achievement.issuer && (
                              <div className="truncate">
                                <strong className="text-muted-foreground">
                                  Issued by:
                                </strong>{" "}
                                {achievement.issuer}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <Zap className="w-3 h-3 text-primary" />
                              <span className="text-primary text-xs">
                                {achievement.points} XP
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold">CTF Teams</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {teams.slice(0, 4).map((team, index) => (
                  <div key={index} className="w-full">
                    <Card className="glass-card relative overflow-hidden transition-all duration-300">
                      <CardHeader className="space-y-1 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 shrink-0">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base sm:text-lg truncate">
                                {team.name}
                              </CardTitle>
                              <CardDescription className="text-sm truncate">
                                {team.role}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-primary/20 shrink-0">
                            <Star className="w-4 h-4 text-primary" />
                            <span className="whitespace-nowrap">
                              LVL {team.level}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm line-clamp-2 mb-3">
                          {team.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {team.specialties.slice(0, 6).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {team.specialties.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{team.specialties.length - 6} more
                            </Badge>
                          )}
                        </div>

                        <a
                          href={team.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full gap-2 text-sm border-primary/50 hover:border-primary hover:bg-primary/10"
                          >
                            Visit team
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <details className="group">
                  <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-primary hover:underline bg-primary/10 rounded-lg">
                    <span>View more teams</span>
                    <span className="transition-transform group-open:rotate-180">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                    {teams.slice(4).map((team, index) => (
                      <div key={index + 4}>
                        <Card className="glass-card relative overflow-hidden transition-all duration-300">
                          <CardHeader className="space-y-1 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 shrink-0">
                                  <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-base sm:text-lg truncate">
                                    {team.name}
                                  </CardTitle>
                                  <CardDescription className="text-sm truncate">
                                    {team.role}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-primary/20 shrink-0">
                                <Star className="w-4 h-4 text-primary" />
                                <span className="whitespace-nowrap">
                                  LVL {team.level}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-sm line-clamp-2 mb-3">
                              {team.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {team.specialties.slice(0, 6).map((specialty) => (
                                <Badge
                                  key={specialty}
                                  variant="secondary"
                                  className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                              {team.specialties.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{team.specialties.length - 6} more
                                </Badge>
                              )}
                            </div>

                            <a
                              href={team.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 block w-full"
                            >
                              <Button
                                variant="outline"
                                className="w-full gap-2 text-sm border-primary/50 hover:border-primary hover:bg-primary/10"
                              >
                                Visit team
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
