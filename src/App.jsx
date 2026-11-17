
import { useState } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";

import "./index.css";

export default function App() {
  const [activeSection, setActiveSection] = useState("Explore");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="app">

      <Header />

      <div className="app-layout">

        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Workspace
          activeSection={activeSection}
          searchQuery={searchQuery}
        />

      </div>

    </div>
  );
}
