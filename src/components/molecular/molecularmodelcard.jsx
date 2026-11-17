
export default function MolecularModelCard({
  model,
  onSelect,
  selected,
}) {
  return (
    <button
      className={
        selected
          ? "molecular-model-card selected"
          : "molecular-model-card"
      }
      onClick={() => onSelect(model)}
    >
      <div className="model-card-top">
        <span>{model.source}</span>
        <span>{model.format?.toUpperCase()}</span>
      </div>

      <h3>{model.title}</h3>

      <p>
        Database ID: {model.sourceId}
      </p>

      <p>
        Classification: {model.category || "Not classified"}
      </p>

      <p>
        Status: {model.scientificStatus || "Not specified"}
      </p>

      <span className="model-card-open">
        Select structure →
      </span>
    </button>
  );
}
