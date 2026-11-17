
import { useState } from "react";
import "./DnaLearning.css";

const bases = [
  { letter: "A", name: "Adenine", color: "blue", partner: "T" },
  { letter: "T", name: "Thymine", color: "red", partner: "A" },
  { letter: "G", name: "Guanine", color: "green", partner: "C" },
  { letter: "C", name: "Cytosine", color: "orange", partner: "G" },
];

const sections = [
  {
    title: "DNA is a twisted ladder",
    description:
      "Imagine a ladder that has been twisted into a spiral. That is the shape of DNA!",
    fact: "The scientific name for this shape is a double helix.",
  },
  {
    title: "Meet the four DNA letters",
    description:
      "DNA uses four special chemical bases. Scientists represent them using four letters: A, T, G and C.",
    fact: "These bases are called nitrogenous bases.",
  },
  {
    title: "The matching partners",
    description:
      "DNA bases have special matching partners. Adenine matches Thymine, while Guanine matches Cytosine.",
    fact: "These are called complementary base pairs.",
  },
  {
    title: "The sides of the ladder",
    description:
      "The two outer sides of DNA are made from alternating sugar and phosphate molecules.",
    fact: "Together, they form the sugar-phosphate backbone.",
  },
  {
    title: "DNA stores instructions",
    description:
      "The order of A, T, G and C stores biological information. Cells use this information to help make proteins.",
    fact: "The order of bases is called the DNA sequence.",
  },
];

export default function DnaLearning() {
  const [activeSection, setActiveSection] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const current = sections[activeSection];

  function nextSection() {
    setActiveSection((previous) =>
      Math.min(previous + 1, sections.length - 1)
    );
  }

  function previousSection() {
    setActiveSection((previous) =>
      Math.max(previous - 1, 0)
    );
  }

  return (
    <section className="dna-learning">

      <div className="learning-heading">
        <span className="learning-tag">DNA EXPLORER</span>
        <h2>Discover the DNA double helix</h2>
        <p>
          Biology becomes easier when you can see what you are learning.
        </p>
      </div>

      {/* DNA twisted ladder */}
      <div className="learning-card">
        <h3>1. DNA is a twisted ladder</h3>
        <p>
          Imagine a ladder twisted into a spiral staircase.
          DNA has two sides and many connecting steps.
        </p>

        <div className="ladder-visual">
          <div className="ladder-side left-side" />
          <div className="ladder-rungs">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                className="ladder-rung"
                key={index}
                style={{
                  transform: `rotate(${index % 2 === 0 ? 12 : -12}deg)`,
                }}
              >
                <span />
                <span />
              </div>
            ))}
          </div>
          <div className="ladder-side right-side" />
        </div>

        <div className="visual-labels">
          <span>Two outer sides</span>
          <span>Connecting steps</span>
        </div>

        <div className="science-fact">
          <strong>Science word: Double helix</strong>
          <p>The twisted, spiral shape of DNA.</p>
        </div>
      </div>

      {/* Four DNA bases */}
      <div className="learning-card">
        <h3>2. Meet the four DNA letters</h3>
        <p>
          DNA uses four chemical bases. Each one has its own letter.
        </p>

        <div className="base-grid">
          {bases.map((base) => (
            <div className={`base-card ${base.color}`} key={base.letter}>
              <div className="base-letter">{base.letter}</div>
              <strong>{base.name}</strong>
            </div>
          ))}
        </div>

        <div className="science-fact">
          <strong>Remember:</strong>
          <p>A, T, G and C are the four bases found in DNA.</p>
        </div>
      </div>

      {/* Base pairing */}
      <div className="learning-card">
        <h3>3. Find the matching partners</h3>
        <p>
          DNA bases fit together in specific pairs, like matching puzzle pieces.
        </p>

        <div className="pairing-visual">
          <div className="pair-row">
            <span className="pair-base blue">A</span>
            <span className="pair-line" />
            <span className="pair-base red">T</span>
          </div>

          <div className="pair-caption">Adenine pairs with Thymine</div>

          <div className="pair-row">
            <span className="pair-base green">G</span>
            <span className="pair-line" />
            <span className="pair-base orange">C</span>
          </div>

          <div className="pair-caption">Guanine pairs with Cytosine</div>
        </div>

        <div className="science-fact">
          <strong>Science word: Base pairing</strong>
          <p>A pairs with T. G pairs with C.</p>
        </div>
      </div>

      {/* Sugar phosphate backbone */}
      <div className="learning-card">
        <h3>4. What makes the sides?</h3>
        <p>
          The outer sides of the DNA ladder are made of sugar and phosphate
          molecules arranged in an alternating pattern.
        </p>

        <div className="backbone-visual">
          <div className="backbone-item sugar">SUGAR</div>
          <div className="backbone-item phosphate">PHOSPHATE</div>
          <div className="backbone-item sugar">SUGAR</div>
          <div className="backbone-item phosphate">PHOSPHATE</div>
          <div className="backbone-item sugar">SUGAR</div>
        </div>

        <div className="science-fact">
          <strong>Science word: Sugar-phosphate backbone</strong>
          <p>It forms the two outer sides of the DNA structure.</p>
        </div>
      </div>

      {/* DNA sequence */}
      <div className="learning-card">
        <h3>5. DNA is an instruction code</h3>
        <p>
          The order of the four bases stores information used by cells.
        </p>

        <div className="sequence-visual">
          {["A", "T", "G", "C", "C", "A", "T", "G"].map(
            (letter, index) => {
              const base = bases.find((item) => item.letter === letter);

              return (
                <span
                  className={`sequence-letter ${base.color}`}
                  key={index}
                >
                  {letter}
                </span>
              );
            }
          )}
        </div>

        <div className="science-fact">
          <strong>Science word: DNA sequence</strong>
          <p>The order in which the DNA bases appear.</p>
        </div>
      </div>

      {/* Learning navigation */}
      <div className="learning-card lesson-navigation">
        <span className="learning-tag">
          YOUR LEARNING JOURNEY
        </span>

        <h3>{current.title}</h3>
        <p>{current.description}</p>

        <div className="science-fact">
          <strong>{current.fact}</strong>
        </div>

        <div className="lesson-progress">
          {sections.map((section, index) => (
            <button
              key={section.title}
              className={activeSection === index ? "active" : ""}
              onClick={() => setActiveSection(index)}
              aria-label={`Go to lesson ${index + 1}`}
            />
          ))}
        </div>

        <div className="lesson-buttons">
          <button
            onClick={previousSection}
            disabled={activeSection === 0}
          >
            Previous
          </button>

          <span>
            {activeSection + 1} / {sections.length}
          </span>

          <button
            onClick={nextSection}
            disabled={activeSection === sections.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      {/* Interactive challenge */}
      <div className="learning-card challenge-card">
        <span className="learning-tag">MINI CHALLENGE</span>
        <h3>Can you find the matching base?</h3>
        <p>Which base pairs with Adenine (A)?</p>

        <div className="challenge-question">A — ?</div>

        <div className="challenge-options">
          {["G", "T", "C"].map((option) => (
            <button
              key={option}
              className={answer === option ? "selected" : ""}
              onClick={() => {
                setAnswer(option);
                setChecked(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          className="check-answer"
          disabled={!answer}
          onClick={() => setChecked(true)}
        >
          Check my answer
        </button>

        {checked && (
          <div
            className={`challenge-feedback ${
              answer === "T" ? "correct" : "incorrect"
            }`}
          >
            {answer === "T"
              ? "Correct! Adenine pairs with Thymine."
              : "Not quite! Adenine pairs with Thymine (T)."}
          </div>
        )}

        <button
          className="reset-challenge"
          onClick={() => {
            setAnswer("");
            setChecked(false);
          }}
        >
          Try again
        </button>
      </div>

    </section>
  );
}
