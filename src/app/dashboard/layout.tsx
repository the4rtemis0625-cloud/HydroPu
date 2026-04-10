"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, History, PieChart, Waves, LogOut, Bell, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-muted/50 shadow-sm">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                <Waves className="w-5 h-5" />
              </div>
              <span className="font-headline font-bold text-xl text-primary tracking-tight">I MISS MY BABYYY!</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground/50 px-3 py-2 text-[10px] uppercase font-bold tracking-widest">General</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Overview">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Analytics">
                      <PieChart className="w-4 h-4" />
                      <span>Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="History">
                      <History className="w-4 h-4" />
                      <span>Data History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-muted-foreground/50 px-3 py-2 text-[10px] uppercase font-bold tracking-widest">System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Alerts">
                      <Bell className="w-4 h-4" />
                      <span>Alert Rules</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings className="w-4 h-4" />
                      <span>Configuration</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-muted/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:text-destructive transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-3xl">
          <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-background/80 border-b border-muted/50 backdrop-blur-md">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-primary">System Monitoring</h2>
              <p className="text-xs text-muted-foreground">Connected to Local Controller Hub</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs font-bold text-accent uppercase tracking-tighter">Live Stream</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-muted-foreground/20 cursor-pointer overflow-hidden">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </header>
          <div className="p-8 pb-16 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
