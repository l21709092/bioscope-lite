
import { Microscope, Settings, CircleHelp } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <Microscope size={25} />
        <span>BIOSCOPE</span>
        <small>LITE</small>
      </div>

      <div className="header-actions">
        <button className="icon-button" aria-label="Help">
          <CircleHelp size={19} />
        </button>

        <button className="icon-button" aria-label="Settings">
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
}
