
import { useState } from "react";

import { searchRCSB } from "../../services/rcsbservice";
import MolecularViewer from "./molecularviewer";

export default function MolecularTest() {
  const [query, setQuery] = useState("DNA");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setModels([]);
    setSelectedModel(null);

    try {
      const results = await searchRCSB(query, 10);

      setModels(results);

      if (results.length === 0) {
        setError("No structures found. Try another search.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: "28px",
      background: "#0b1118",
      color: "#e7f2f4"
    }}>
      <h1>Molecular Engine Test</h1>
      <p>Testing RCSB search and Mol* 3D rendering.</p>

      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search DNA, RNA, proteins..."
          style={{ padding: "12px", width: "60%" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "12px", marginLeft: "10px" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
        marginTop: "24px"
      }}>
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model)}
            style={{
              padding: "16px",
              textAlign: "left",
              background: selectedModel?.id === model.id
                ? "#21434a"
                : "#17232d",
              color: "white",
              border: "1px solid #36515c",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            <strong>{model.title}</strong>
            <p>{model.sourceId}</p>
            <small>{model.scientificStatus}</small>
          </button>
        ))}
      </section>

      {selectedModel && (
        <section style={{ marginTop: "28px" }}>
          <h2>{selectedModel.title}</h2>
          <MolecularViewer model={selectedModel} />
        </section>
      )}
    </main>
  );
}
