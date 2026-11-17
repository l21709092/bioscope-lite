
import { useState } from "react";

import {
  Menu,
  X
} from "lucide-react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";

import "./index.css";

export default function App() {
  const [activeSection, setActiveSection] = useState("Explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSectionSelect = (section) => {
    setActiveSection(section);

    if (section !== "Molecular Biology") {
      setSelectedStructure(null);
    }
  };

  const handleStructureSelect = (structure) => {
    setSelectedStructure(structure);
    setActiveSection("Molecular Biology");
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="app">
      <Header />

      <div className="app-layout">

        <button
          className="mobile-navigation-toggle"
          onClick={() =>
            setMobileSidebarOpen((previous) => !previous)
          }
          aria-label={
            mobileSidebarOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen
            ? <X size={22} />
            : <Menu size={22} />
          }
        </button>

        {mobileSidebarOpen && (
          <button
            className="sidebar-overlay"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          />
        )}

        <Sidebar
          activeSection={activeSection}
          onSelectSection={handleSectionSelect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStructure={selectedStructure}
          onSelectStructure={handleStructureSelect}
          mobileOpen={mobileSidebarOpen}
          onClose={closeMobileSidebar}
        />

        <Workspace
          activeSection={activeSection}
          searchQuery={searchQuery}
          selectedStructure={selectedStructure}
          onSelectStructure={handleStructureSelect}
        />

      </div>
    </div>
  );
}
