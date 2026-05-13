import {Mic, Puzzle, MessageSquare, FileText, BarChart3, History} from "lucide-react"
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

const items = [
    {title: "JAM", url: "#", icon: Mic, id: "jam"},
    {title: "Jumble", url: "#", icon: Puzzle, id: "jumble"},
    {title: "Speech", url: "#", icon: MessageSquare, id: "speech"},
    {title: "Scenarios", url: "#", icon: FileText, id: "scenario"},
    {title: "Summary", url: "#", icon: BarChart3, id: "summary"},
    {title: "History", url: "#", icon: History, id: "history"},
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
            </SidebarContent>
        </Sidebar>
    )
}