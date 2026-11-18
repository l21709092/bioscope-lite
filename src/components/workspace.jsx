import { lazy, Suspense, useState } from "react";
import Viewer from "./viewer";
import Inspector from "./inspector";
import AnatomySection from "../anatomy/AnatomySection";
import { Search, ArrowRight } from "lucide-react";

const ImmunologyHub = lazy(() => import("../immunology/ImmunologyHub"));
const MolecularBiologyHub = lazy(() => import("../molecular-biology/MolecularBiologyHub"));
const BotanyHub = lazy(() => import("../botany/BotanyHub"));

const SEARCH_STREAMS = [
  { section: "Human Anatomy", terms: ["anatomy", "heart", "lung", "respiratory", "brain", "body", "organ"], description: "Explore heart, lungs, brain and organ anatomy." },
  { section: "Molecular Biology", terms: ["molecular", "dna", "rna", "protein", "ribosome", "atp", "membrane"], description: "Explore DNA, molecular structures and gene processes." },
  { section: "Botany", terms: ["botany", "flower", "pollination", "pollen", "ovule", "plant"], description: "Explore flower anatomy and plant reproduction." },
  { section: "Immunology", terms: ["immunology", "immune", "cell", "antibody", "white blood"], description: "Explore immune cells, antibodies and immune responses." },
];

export default function Workspace({ activeSection = "Explore", searchQuery = "", onSelectSection = () => {} }) {
  const [selectedAtom, setSelectedAtom] = useState(null);

  if (activeSection === "Immunology") {
    return <Suspense fallback={<main className="immunology-loading">Loading Immunology lab…</main>}><ImmunologyHub /></Suspense>;
  }

  if (activeSection === "Molecular Biology") {
    return <Suspense fallback={<main className="molecular-loading">Loading Molecular Biology lab…</main>}><MolecularBiologyHub searchQuery={searchQuery} /></Suspense>;
  }

  if (activeSection === "Botany") {
    return <Suspense fallback={<main className="botany-loading">Loading Botany lab…</main>}><BotanyHub /></Suspense>;
  }

  if (activeSection === "Human Anatomy") {
    return <AnatomySection searchQuery={searchQuery} />;
  }

  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    const results = SEARCH_STREAMS.filter((item) =>
      item.terms.some((term) => term.includes(query) || query.includes(term))
    );

    return (
      <main className="workspace search-workspace">
        <section className="welcome">
          <p className="eyebrow"><Search size={14} /> BIOSCOPE SEARCH</p>
          <h1>Results for “{searchQuery.trim()}”</h1>
          <p>{results.length ? `${results.length} learning section${results.length === 1 ? "" : "s"} match your search.` : "No matching learning sections yet. Try heart, lung, DNA, flower, cell, or immune."}</p>
        </section>
        {results.length > 0 && <div className="search-results-list">
          {results.map((item) => <button key={item.section} type="button" onClick={() => onSelectSection(item.section)}>
            <span><strong>{item.section}</strong><small>{item.description}</small></span><ArrowRight size={17} />
          </button>)}
        </div>}
      </main>
    );
  }

  return (
    <main className="workspace">
      <section className="welcome">
        <p className="eyebrow">EXPLORE THE SCIENCE OF LIFE</p>
        <h1>Biology, brought to life.</h1>
        <p>Explore real biological structures in interactive 3D.</p>
      </section>

      <div className="exploration-grid">
        <Viewer onSelect={setSelectedAtom} />
        <Inspector selectedAtom={selectedAtom} />
      </div>
    </main>
  );
}
