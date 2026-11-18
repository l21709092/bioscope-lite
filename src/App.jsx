
import { useState } from "react";

import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Workspace from "./components/workspace";

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
          onSelectSection={setActiveSection}
        />

      </div>

    </div>
  );
}
