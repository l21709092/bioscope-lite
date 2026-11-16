
import { Info, BookOpen } from "lucide-react";

export default function Inspector() {
  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <Info size={19} />
        <h3>Structure Inspector</h3>
      </div>

      <div className="empty-inspector">
        <BookOpen size={30} />
        <h4>Nothing selected</h4>
        <p>Select a biological structure to learn about it.</p>
      </div>

      <div className="inspector-tip">
        <strong>Learning tip</strong>
        <p>Explore the 3D model to discover its components.</p>
      </div>
    </aside>
  );
}
