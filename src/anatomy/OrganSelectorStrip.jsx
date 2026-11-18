import { ORGAN_PRESETS } from "./organStudioData";
import { Heart, Brain, Wind, Shield, Filter, Utensils, Sparkles, ShieldAlert, Bone, Eye } from "lucide-react";

const ICON_MAP = {
  Heart,
  Brain,
  Wind,
  Shield,
  Filter,
  Utensils,
  Sparkles,
  ShieldAlert,
  Bone,
  Eye,
};

export default function OrganSelectorStrip({
  activeOrganId = "heart",
  onSelectOrgan = () => {},
  isStudioActive = false,
}) {
  return (
    <div className="organ-selector-container">
      <div className="organ-strip-header">
        <span className="organ-strip-label">SELECT 3D ORGAN SPECIMEN</span>
        <span className="organ-strip-sub">Click any organ for high-definition 3D studio exploration</span>
      </div>

      <div className="organ-strip-scroll" role="tablist" aria-label="3D Organ Library">
        {ORGAN_PRESETS.map((organ) => {
          const IconComponent = ICON_MAP[organ.icon] || Heart;
          const isActive = isStudioActive && activeOrganId === organ.id;

          return (
            <button
              key={organ.id}
              className={`organ-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectOrgan(organ.id)}
              style={{
                "--organ-color": organ.color,
              }}
              title={`Explore ${organ.name} in isolated 3D`}
            >
              <span className="organ-pill-icon">
                <IconComponent size={15} />
              </span>
              <span className="organ-pill-name">{organ.name}</span>
              <span className="organ-pill-sys">{organ.system.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
