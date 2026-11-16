
import {
  Compass,
  Dna,
  Microscope,
  Brain,
  Clock3
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar-heading">WORKSPACE</p>

      <button className="nav-item active">
        <Compass size={18} />
        Explore
      </button>

      <p className="sidebar-heading">BIOLOGY LIBRARY</p>

      <button className="nav-item">
        <Dna size={18} />
        Molecular Biology
      </button>

      <button className="nav-item">
        <Microscope size={18} />
        Cell Biology
      </button>

      <button className="nav-item">
        <Brain size={18} />
        Neuroscience
      </button>

      <p className="sidebar-heading">YOUR WORK</p>

      <button className="nav-item">
        <Clock3 size={18} />
        Recent Scenes
      </button>

      <div className="sidebar-footer">
        <span className="status-dot" />
        BioScope Engine Ready
      </div>
    </aside>
  );
}

