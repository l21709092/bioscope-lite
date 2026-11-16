
import { Info, BookOpen, PlayCircle } from "lucide-react";

const bases = {
  DA: {
    name: "Adenine",
    symbol: "A",
    function: "Adenine is one of the four nitrogenous bases in DNA. It pairs with thymine (T)."
  },
  DT: {
    name: "Thymine",
    symbol: "T",
    function: "Thymine is a DNA base that pairs with adenine (A)."
  },
  DG: {
    name: "Guanine",
    symbol: "G",
    function: "Guanine is a DNA base that pairs with cytosine (C)."
  },
  DC: {
    name: "Cytosine",
    symbol: "C",
    function: "Cytosine is a DNA base that pairs with guanine (G)."
  }
};

export default function Inspector({ selectedAtom }) {
  const base = selectedAtom
    ? bases[selectedAtom.residue]
    : null;

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <Info size={19} />
        <h3>Structure Inspector</h3>
      </div>

      {!selectedAtom ? (
        <div className="empty-inspector">
          <BookOpen size={30} />
          <h4>Explore your DNA</h4>
          <p>
            Click an atom in the 3D model to inspect
            its molecular structure.
          </p>
        </div>
      ) : (
        <div className="structure-details">
          <p className="detail-label">SELECTED NUCLEOTIDE</p>

          <h2>
            {base ? base.name : selectedAtom.residue}
          </h2>

          {base && (
            <div className="base-symbol">
              {base.symbol}
            </div>
          )}

          <div className="detail-card">
            <strong>Atom</strong>
            <p>{selectedAtom.atom}</p>
          </div>

          <div className="detail-card">
            <strong>Element</strong>
            <p>{selectedAtom.element}</p>
          </div>

          <div className="detail-card">
            <strong>Residue number</strong>
            <p>{selectedAtom.residueNumber}</p>
          </div>

          <div className="detail-card">
            <strong>Biological function</strong>
            <p>
              {base
                ? base.function
                : "This atom is part of the nucleotide's molecular structure."}
            </p>
          </div>
        </div>
      )}

      <div className="learning-section">
        <h3>Continue learning</h3>

        <a
          href="https://www.biointeractive.org/classroom-resources/chemical-structure-dna"
          target="_blank"
          rel="noreferrer"
          className="learning-link"
        >
          <BookOpen size={18} />
          <span>Read: Chemical structure of DNA</span>
        </a>

        <a
          href="https://www.biointeractive.org/classroom-resources/paired-dna-strands"
          target="_blank"
          rel="noreferrer"
          className="learning-link"
        >
          <PlayCircle size={18} />
          <span>Watch: Paired DNA strands</span>
        </a>
      </div>
    </aside>
  );
}
