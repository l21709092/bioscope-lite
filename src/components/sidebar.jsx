
import {
  Search,
  Compass,
  Dna,
  Brain,
  Leaf,
  HeartPulse,
  ShieldCheck,
  History,
  Bookmark,
  Atom
} from "lucide-react";

const categories = [
  { id: "Molecular Biology", icon: Dna },
  { id: "Neuroscience", icon: Brain },
  { id: "Botany", icon: Leaf },
  { id: "Human Physiology", icon: HeartPulse },
  { id: "Immunology", icon: ShieldCheck }
];

export default function Sidebar({
  activeSection,
  onSelectSection,
  searchQuery,
  setSearchQuery
}) {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <Atom size={21} />
        <span>EXPLORE</span>
      </div>

      <div className="sidebar-search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search biology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <p className="sidebar-heading">WORKSPACE</p>

      <button
        className={`nav-item ${activeSection === "Explore" ? "active" : ""}`}
        onClick={() => onSelectSection("Explore")}
      >
        <Compass size={18} />
        Explore
      </button>

      <p className="sidebar-heading">BIOLOGY STREAMS</p>

      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <button
            key={category.id}
            className={`nav-item ${
              activeSection === category.id ? "active" : ""
            }`}
            onClick={() => onSelectSection(category.id)}
          >
            <Icon size={18} />
            {category.id}
          </button>
        );
      })}

      <p className="sidebar-heading">YOUR LIBRARY</p>

      <button
        className={`nav-item ${activeSection === "History" ? "active" : ""}`}
        onClick={() => onSelectSection("History")}
      >
        <History size={18} />
        Recently explored
      </button>

      <button
        className={`nav-item ${activeSection === "Bookmarks" ? "active" : ""}`}
        onClick={() => onSelectSection("Bookmarks")}
      >
        <Bookmark size={18} />
        Bookmarks
      </button>

      <div className="sidebar-footer">
        <span className="status-dot" />
        BioScope Engine
      </div>

    </aside>
  );
}
