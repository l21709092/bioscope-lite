
import { SYSTEM_KEYS, SYSTEM_LABELS } from "./anatomyData";

export default function AnatomyControls({
  sex,
  setSex,
  activeSystems,
  setActiveSystems,
  search,
  setSearch,
}) {
  const toggleSystem = (system) => {
    setActiveSystems((current) =>
      current.includes(system)
        ? current.filter((item) => item !== system)
        : [...current, system]
    );
  };

  return (
    <div className="anatomy-controls">
      <div className="control-heading">BODY MODEL</div>

      <div className="sex-toggle">
        <button
          className={sex === "female" ? "active" : ""}
          onClick={() => setSex("female")}
        >
          Female
        </button>
        <button
          className={sex === "male" ? "active" : ""}
          onClick={() => setSex("male")}
        >
          Male
        </button>
      </div>

      <div className="control-heading">BODY SYSTEMS</div>

      {SYSTEM_KEYS.map((system) => (
        <label className="system-option" key={system}>
          <input
            type="checkbox"
            checked={activeSystems.includes(system)}
            onChange={() => toggleSystem(system)}
          />
          <span>{SYSTEM_LABELS[system]}</span>
        </label>
      ))}

      <button
        className="reset-systems"
        onClick={() => setActiveSystems(SYSTEM_KEYS)}
      >
        Show all systems
      </button>

      <div className="control-heading">FIND STRUCTURE</div>

      <input
        className="anatomy-search"
        placeholder="Search heart, brain, lungs..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </div>
  );
}
