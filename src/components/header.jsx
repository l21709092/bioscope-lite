
import { Microscope } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <Microscope size={25} />
        <span>BIOSCOPE</span>
        <small>LITE</small>
      </div>

    </header>
  );
}
