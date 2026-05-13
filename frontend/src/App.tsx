import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { useState } from "react";
import Home from "./Home";
import JamPage from "./pages/JamPage";
import JumblePage from "./pages/JumblePage";
import ScenarioPage from "./pages/ScenarioPage";
import SpeechPage from "./pages/SpeechPage";
import SummaryPage from "./pages/SummaryPage";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "jam":
        return <JamPage />;
      case "jumble":
        return <JumblePage />;
      case "scenario":
        return <ScenarioPage />;
      case "speech":
        return <SpeechPage />;
      case "summary":
        return <SummaryPage />;
      default:
        return <Home />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar onNavigate={setActiveTab} />
        <main className="flex-1 bg-slate-50 p-6">
          <SidebarTrigger className="mb-4" />

          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default App;

