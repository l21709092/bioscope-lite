
import { useState } from "react";

import {
  Search,
  Compass,
  Dna,
  Microscope,
  Brain,
  Leaf,
  HeartPulse,
  History,
  Bookmark,
  Atom,
  Activity,
  Network,
  Zap,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react";

const categories = [
  { id: "Molecular Biology", icon: Dna },
  { id: "Cell Biology", icon: Microscope },
  { id: "Neuroscience", icon: Brain },
  { id: "Botany", icon: Leaf },
  { id: "Human Physiology", icon: HeartPulse }
];

export const structures = [
  {
    id: "dna",
    name: "DNA",
    subtitle: "Double helix and nucleotide structure",
    icon: Dna,
    available: true
  },
  {
    id: "rna",
    name: "RNA",
    subtitle: "Ribonucleic acid",
    icon: Activity,
    available: false
  },
  {
    id: "proteins",
    name: "Proteins",
    subtitle: "Protein folding and structure",
    icon: Network,
    available: false
  },
  {
    id: "ribosome",
    name: "Ribosome",
    subtitle: "Cellular protein synthesis machinery",
    icon: Atom,
    available: false
  },
  {
    id: "atp-synthase",
    name: "ATP Synthase",
    subtitle: "Cellular energy production",
    icon: Zap,
    available: false
  },
  {
    id: "rna-polymerase",
    name: "RNA Polymerase",
    subtitle: "Enzyme involved in transcription",
    icon: FlaskConical,
    available: false
  }
];

export default function Sidebar({
  activeSection,
  onSelectSection,
  searchQuery,
  setSearchQuery,
  selectedStructure,
  onSelectStructure,
  mobileOpen,
  onClose
}) {
  const [molecularExpanded, setMolecularExpanded] = useState(false);
  const [structureSearch, setStructureSearch] = useState("");

  const filteredStructures = structures.filter((structure) =>
    structure.name.toLowerCase().includes(
      structureSearch.toLowerCase()
    )
  );

  const handleCategoryClick = (category) => {
    onSelectSection(category.id);

    if (category.id === "Molecular Biology") {
      setMolecularExpanded((previous) => !previous);
    } else {
      onClose();
    }
  };

  const handleStructureClick = (structure) => {
    onSelectStructure(structure);
    setMolecularExpanded(true);
    onClose();
  };

  const handleOtherNavigation = (section) => {
    onSelectSection(section);
    onClose();
  };

  return (
    <>
      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div className="sidebar-mobile-header">
          <span>BIOSCOPE NAVIGATION</span>

          <button
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

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
          className={`nav-item ${
            activeSection === "Explore" ? "active" : ""
          }`}
          onClick={() => handleOtherNavigation("Explore")}
        >
          <Compass size={18} />
          <span>Explore</span>
        </button>

        <p className="sidebar-heading">BIOLOGY STREAMS</p>

        {categories.map((category) => {
          const Icon = category.icon;
          const isMolecular = category.id === "Molecular Biology";

          return (
            <div key={category.id} className="category-group">
              <button
                className={`nav-item ${
                  activeSection === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
                aria-expanded={
                  isMolecular ? molecularExpanded : undefined
                }
              >
                <Icon size={18} />

                <span className="category-name">
                  {category.id}
                </span>

                {isMolecular && (
                  molecularExpanded
                    ? <ChevronDown size={15} />
                    : <ChevronRight size={15} />
                )}
              </button>

              {isMolecular && molecularExpanded && (
                <div className="molecular-submenu">
                  <div className="structure-search">
                    <Search size={14} />

                    <input
                      type="text"
                      placeholder="Find a structure..."
                      value={structureSearch}
                      onChange={(e) =>
                        setStructureSearch(e.target.value)
                      }
                    />
                  </div>

                  <div className="structure-list">
                    {filteredStructures.map((structure) => {
                      const StructureIcon = structure.icon;

                      return (
                        <button
                          key={structure.id}
                          className={`structure-nav-item ${
                            selectedStructure?.id === structure.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleStructureClick(structure)
                          }
                        >
                          <StructureIcon size={16} />

                          <span>{structure.name}</span>

                          {!structure.available && (
                            <span className="coming-soon-dot" />
                          )}
                        </button>
                      );
                    })}

                    {filteredStructures.length === 0 && (
                      <p className="no-structures">
                        No structures found
                      </p>
                    )}
                  </div>

                  <p className="submenu-hint">
                    {structures.filter((item) => item.available).length}
                    {" "}interactive model available
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <p className="sidebar-heading">YOUR LIBRARY</p>

        <button
          className={`nav-item ${
            activeSection === "History" ? "active" : ""
          }`}
          onClick={() => handleOtherNavigation("History")}
        >
          <History size={18} />
          <span>Recently explored</span>
        </button>

        <button
          className={`nav-item ${
            activeSection === "Bookmarks" ? "active" : ""
          }`}
          onClick={() => handleOtherNavigation("Bookmarks")}
        >
          <Bookmark size={18} />
          <span>Bookmarks</span>
        </button>

        <div className="sidebar-footer">
          <span className="status-dot" />
          BioScope Engine
        </div>
      </aside>
    </>
  );
}
