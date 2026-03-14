import {Mic, Puzzle, MessageSquare, FileText, BarChart3, Settings, User} from "lucide-react"
import {
    Sidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
    SidebarGroup, 
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {title: "JAM", url: "#", icon: Mic, id: "jam"},
    {title: "Jumble", url: "#", icon: Puzzle, id: "jumble"},
    {title: "Speech", url: "#", icon: MessageSquare, id: "speech"},
    {title: "Scenarios", url: "#", icon: FileText, id: "scenario"},
    {title: "Summary", url: "#", icon: BarChart3, id: "summary"},
]

export function AppSidebar({onNavigate}: {onNavigate: (id: string) => void}){
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton onClick={() => onNavigate('home')}>
                    Talk Couch
                </SidebarMenuButton>
                
            </SidebarHeader>
            <hr/>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Practice Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild onClick={()=> onNavigate(item.id)}>
                                        <button>
                                            <item.icon className="w-4 h-4"/>
                                            <span>{item.title}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Personal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>History</SidebarMenuButton>
                                <SidebarMenuButton>Activity</SidebarMenuButton>
                                <SidebarMenuButton>Other</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <hr/>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings className="w-4 h-4"/>
                            <span>Settings</span>
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <User className="w-4 h-4"/>
                            <span>Accounts</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}