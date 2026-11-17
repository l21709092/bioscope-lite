
import { useEffect, useState } from "react";
import {
  Dna,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  RotateCcw
} from "lucide-react";

const questionBank = [
  {
    id: "DA",
    title: "Adenine detected!",
    question: "Which DNA base pairs with adenine?",
    options: ["Guanine", "Thymine", "Cytosine", "Uracil"],
    answer: 1,
    hint: "Think about the two complementary bases that form an A–T pair.",
    explanation:
      "Adenine pairs with thymine through two hydrogen bonds in DNA."
  },
  {
    id: "DT",
    title: "Thymine detected!",
    question: "Which nitrogenous base pairs with thymine?",
    options: ["Adenine", "Guanine", "Cytosine", "Uracil"],
    answer: 0,
    hint: "Remember the complementary base pairing rule in DNA.",
    explanation:
      "Thymine pairs specifically with adenine in DNA."
  },
  {
    id: "DG",
    title: "Guanine detected!",
    question: "How many hydrogen bonds connect guanine and cytosine?",
    options: ["One", "Two", "Three", "Four"],
    answer: 2,
    hint: "This base pair forms a stronger connection than the A–T pair.",
    explanation:
      "Guanine and cytosine form three hydrogen bonds."
  },
  {
    id: "DC",
    title: "Cytosine detected!",
    question: "Which DNA base pairs with cytosine?",
    options: ["Adenine", "Thymine", "Guanine", "Uracil"],
    answer: 2,
    hint: "Look at the complementary pairing partner of guanine.",
    explanation:
      "Cytosine pairs with guanine through three hydrogen bonds."
  },
  {
    id: "DEFAULT",
    title: "DNA component detected!",
    question: "What are the three components of a DNA nucleotide?",
    options: [
      "Sugar, phosphate and nitrogenous base",
      "Protein, lipid and sugar",
      "Amino acid, phosphate and water",
      "Sugar, oxygen and protein"
    ],
    answer: 0,
    hint: "A nucleotide contains a sugar, a chemical group forming part of the backbone, and one variable component.",
    explanation:
      "A DNA nucleotide consists of deoxyribose sugar, a phosphate group and a nitrogenous base."
  }
];

export default function DnaQuiz({ selectedAtom }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questionBank[currentIndex];
  const selectedAnswer = answers[currentIndex] ?? null;
  const isSubmitted = submitted[currentIndex] ?? false;

  useEffect(() => {
    if (!selectedAtom) return;

    const residue = String(
      selectedAtom.residue || ""
    ).toUpperCase();

    const matchingIndex = questionBank.findIndex(
      (question) => question.id === residue
    );

    setCurrentIndex(matchingIndex === -1 ? 4 : matchingIndex);
    setAnswers({});
    setSubmitted({});
    setShowHint(false);
  }, [selectedAtom]);

  const isCorrect =
    selectedAnswer === currentQuestion.answer;

  const selectAnswer = (index) => {
    if (isSubmitted) return;

    setAnswers((previous) => ({
      ...previous,
      [currentIndex]: index
    }));
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setSubmitted((previous) => ({
      ...previous,
      [currentIndex]: true
    }));
  };

  const goNext = () => {
    if (currentIndex < questionBank.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setShowHint(false);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setShowHint(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted({});
    setShowHint(false);
  };

  const completedCount = Object.values(submitted).filter(
    Boolean
  ).length;

  const progress = (
    (completedCount / questionBank.length) * 100
  );

  return (
    <section className="dna-context-quiz">

      {/* QUIZ HEADER */}
      <div className="context-quiz-header">
        <div className="context-quiz-icon">
          <Dna size={22} />
        </div>

        <div>
          <span>BIOSCOPE ACTIVE LEARNING</span>
          <h2>DNA Knowledge Check</h2>
        </div>
      </div>

      {/* SELECTED DNA COMPONENT */}
      <div className="detected-component">
        <span>SELECTED COMPONENT</span>

        <strong>
          {selectedAtom
            ? `${selectedAtom.residue || "DNA"} · ${selectedAtom.atom}`
            : "Explore the DNA structure"}
        </strong>

        <small>
          {selectedAtom
            ? `Element: ${selectedAtom.element} | Residue: ${selectedAtom.residueNumber}`
            : "Click an atom in the 3D model to begin."}
        </small>
      </div>

      {/* PROGRESS */}
      <div className="quiz-progress-section">
        <div className="quiz-progress-label">
          <span>YOUR PROGRESS</span>
          <span>
            {completedCount}/{questionBank.length} completed
          </span>
        </div>

        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* QUESTION */}
      <div className="context-quiz-content">

        <div className="quiz-question-top">
          <p className="quiz-eyebrow">
            QUESTION {currentIndex + 1} OF {questionBank.length}
          </p>

          <span className="quiz-topic-tag">
            DNA BASICS
          </span>
        </div>

        <h3>{currentQuestion.title}</h3>

        <p className="context-question">
          {currentQuestion.question}
        </p>

        {/* HELP BUTTON */}
        <button
          className="quiz-help-button"
          onClick={() => setShowHint((previous) => !previous)}
        >
          <Lightbulb size={17} />
          {showHint ? "Hide hint" : "Need help?"}
        </button>

        {showHint && (
          <div className="quiz-hint-box">
            <strong>Here's a hint:</strong>
            <p>{currentQuestion.hint}</p>
          </div>
        )}

        {/* ANSWER OPTIONS */}
        <div className="context-options">
          {currentQuestion.options.map((option, index) => {
            const correct = index === currentQuestion.answer;
            const selected = index === selectedAnswer;

            let className = "";

            if (isSubmitted && correct) {
              className = "correct";
            } else if (isSubmitted && selected && !correct) {
              className = "incorrect";
            } else if (selected) {
              className = "selected";
            }

            return (
              <button
                key={option}
                className={`context-option ${className}`}
                disabled={isSubmitted}
                onClick={() => selectAnswer(index)}
              >
                <span>
                  {String.fromCharCode(65 + index)}
                </span>

                {option}

                {isSubmitted && correct && (
                  <CheckCircle2 size={18} />
                )}

                {isSubmitted && selected && !correct && (
                  <XCircle size={18} />
                )}
              </button>
            );
          })}
        </div>

        {/* ANSWER FEEDBACK */}
        {isSubmitted && (
          <div className="context-explanation">
            <strong>
              {isCorrect
                ? "Excellent! Correct answer."
                : "Not quite! Let's learn why."}
            </strong>

            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* CHECK ANSWER */}
        {!isSubmitted && (
          <button
            className="quiz-action-button"
            disabled={selectedAnswer === null}
            onClick={checkAnswer}
          >
            Check answer
            <ArrowRight size={17} />
          </button>
        )}

        {/* NAVIGATION */}
        <div className="quiz-navigation">

          <button
            className="quiz-nav-button"
            onClick={goPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          {currentIndex < questionBank.length - 1 ? (
            <button
              className="quiz-nav-button next"
              onClick={goNext}
            >
              Next
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              className="quiz-nav-button next"
              onClick={restartQuiz}
            >
              <RotateCcw size={17} />
              Restart
            </button>
          )}

        </div>

      </div>
    </section>
  );
}
