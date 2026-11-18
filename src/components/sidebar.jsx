
import {
  Search,
  Compass,
  Dna,
  Leaf,
  ShieldCheck,
  Bone,
  Atom
} from "lucide-react";

const categories = [
  { id: "Molecular Biology", icon: Dna },
  { id: "Botany", icon: Leaf },
  { id: "Human Anatomy", icon: Bone },
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

      <div className="sidebar-footer">
        <span className="status-dot" />
        BioScope Engine
      </div>

    </aside>
  );
}
