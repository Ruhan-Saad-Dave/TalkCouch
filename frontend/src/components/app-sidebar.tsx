import { Mic, Puzzle, MessageSquare, FileText, BarChart3, History, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const practiceItems = [
    { title: "JAM",       icon: Mic,           id: "jam"      },
    { title: "Jumble",    icon: Puzzle,         id: "jumble"   },
    { title: "Speech",    icon: MessageSquare,  id: "speech"   },
    { title: "Scenarios", icon: FileText,       id: "scenario" },
    { title: "Summary",   icon: BarChart3,      id: "summary"  },
]

const utilityItems = [
    { title: "History",  icon: History,  id: "history"  },
    { title: "Settings", icon: Settings, id: "settings" },
]

export function AppSidebar({ onNavigate }: { onNavigate: (id: string) => void }) {
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton onClick={() => onNavigate('home')}>
                    Talk Couch
                </SidebarMenuButton>
            </SidebarHeader>
            <hr />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Practice</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {practiceItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild onClick={() => onNavigate(item.id)}>
                                        <button>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {utilityItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild onClick={() => onNavigate(item.id)}>
                                        <button>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
