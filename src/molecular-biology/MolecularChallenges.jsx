import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { molecularQuiz as questionBank } from "./molecularData";

const processOrder = ["DNA is opened", "RNA primer is placed", "DNA polymerase extends new strands", "Two DNA molecules form"];
const difficultyRank = { Basic: 0, Intermediate: 1, Advanced: 2 };
const molecularQuiz = [...questionBank].sort((left, right) => difficultyRank[left.level] - difficultyRank[right.level]);

function swap(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function MolecularChallenges({ onComplete }) {
  const [mode, setMode] = useState("quiz");
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [checked, setChecked] = useState(false);
  const [responses, setResponses] = useState({});
  const [order, setOrder] = useState(() => [processOrder[2], processOrder[0], processOrder[3], processOrder[1]]);
  const [orderFeedback, setOrderFeedback] = useState(null);
  const question = molecularQuiz[index];
  const complete = Object.keys(responses).length === molecularQuiz.length;
  const score = Object.values(responses).filter(Boolean).length;
  const topicResults = useMemo(() => [...new Set(molecularQuiz.map(item => item.topic))].map(topic => {
    const questions = molecularQuiz.map((item, questionIndex) => ({ item, questionIndex })).filter(row => row.item.topic === topic);
    const answered = questions.filter(row => Object.prototype.hasOwnProperty.call(responses, row.questionIndex));
    return { topic, correct: answered.filter(row => responses[row.questionIndex]).length, total: questions.length };
  }), [responses]);

  const selectAnswer = answer => { if (checked) return; setChoice(answer); };
  const checkAnswer = () => {
    if (choice === null || checked) return;
    const correct = choice === question.answer;
    setResponses(previous => ({ ...previous, [index]: correct }));
    setChecked(true);
    if (index === molecularQuiz.length - 1) onComplete?.("molecular-quiz");
  };
  const advance = direction => {
    if (!checked) return;
    const next = index + direction;
    if (next >= molecularQuiz.length) { onComplete?.("molecular-quiz"); return; }
    setIndex(Math.max(0, next));
    setChoice(null);
    setChecked(false);
  };
  const restart = () => { setIndex(0); setChoice(null); setChecked(false); setResponses({}); };
  const checkOrder = () => {
    const correct = order.every((item, position) => item === processOrder[position]);
    setOrderFeedback(correct);
    if (correct) onComplete?.("molecular-order");
  };

  return <section className="mb-card molecular-challenges">
    <div className="mb-panel-heading"><div><span className="mb-kicker">TEST YOURSELF</span><h2>Molecular challenges</h2></div></div>
    <div className="mb-tab-switch challenge-mode-switch" role="group" aria-label="Choose challenge type">
      <button className={mode === "quiz" ? "active" : ""} onClick={() => setMode("quiz")} aria-pressed={mode === "quiz"}>15-question quiz</button>
      <button className={mode === "order" ? "active" : ""} onClick={() => setMode("order")} aria-pressed={mode === "order"}>Process ordering</button>
    </div>
    {mode === "quiz" ? <>
      {complete ? <div className="mb-quiz-results">
        <div className="mb-score-dial"><strong>{score}</strong><span>/{molecularQuiz.length}</span></div>
        <div><span className="mb-kicker">QUIZ COMPLETE</span><h3>{score >= 12 ? "Strong molecular reasoning" : "Review and try again"}</h3><p>You answered {score} of {molecularQuiz.length} correctly. Revisit any topic below, then reset for another attempt.</p></div>
        <div className="mb-topic-results">{topicResults.map(item => <div key={item.topic}><span>{item.topic}</span><strong>{item.correct}/{item.total}</strong><i><b style={{ width: `${item.correct / item.total * 100}%` }} /></i></div>)}</div>
        <button className="mb-primary-button" onClick={restart}><RotateCcw size={15} />Retry quiz</button>
      </div> : <div className="mb-question-card" aria-live="polite">
        <div className="mb-question-meta"><span>{question.topic}</span><span>{question.level}</span><span>Question {index + 1} of {molecularQuiz.length}</span></div>
        <div className="mb-quiz-progress" aria-label={`Question ${index + 1} of ${molecularQuiz.length}`}>{molecularQuiz.map((item, position) => <i key={position} className={responses[position] === true ? "correct" : responses[position] === false ? "wrong" : position === index ? "current" : ""} />)}</div>
        <h3>{question.prompt}</h3>
        <div className="mb-question-options">{question.options.map((option, answerIndex) => <button key={option} className={`${choice === answerIndex ? "chosen" : ""} ${checked && answerIndex === question.answer ? "correct" : checked && choice === answerIndex ? "wrong" : ""}`} onClick={() => selectAnswer(answerIndex)} disabled={checked} aria-pressed={choice === answerIndex}><span>{String.fromCharCode(65 + answerIndex)}</span>{option}</button>)}</div>
        {checked && <div className={`mb-question-feedback ${choice === question.answer ? "correct" : "wrong"}`} role="status"><strong>{choice === question.answer ? "Correct" : "Review this"}</strong><p>{question.explain}</p></div>}
        <div className="mb-question-actions">
          <button onClick={() => advance(-1)} disabled={index === 0}><ChevronLeft size={15} />Previous</button>
          {!checked ? <button className="mb-primary-button" disabled={choice === null} onClick={checkAnswer}><Check size={15} />Check answer</button> : <button className="mb-primary-button" onClick={() => advance(1)}>{index === molecularQuiz.length - 1 ? "See results" : "Next question"}<ChevronRight size={15} /></button>}
          <button onClick={restart}><RotateCcw size={14} />Reset</button>
        </div>
      </div>}
    </> : <div className="mb-order-challenge">
      <span className="mb-kicker">REPLICATION · ORDER THE EVENTS</span><h3>Arrange the steps of DNA replication</h3><p>Use the arrows to move each event into the order it happens.</p>
      <ol>{order.map((item, position) => <li key={item}><span>{position + 1}</span><strong>{item}</strong><div><button onClick={() => { setOrder(current => swap(current, position, -1)); setOrderFeedback(null); }} disabled={position === 0} aria-label={`Move ${item} earlier`}><ArrowUp size={15} /></button><button onClick={() => { setOrder(current => swap(current, position, 1)); setOrderFeedback(null); }} disabled={position === order.length - 1} aria-label={`Move ${item} later`}><ArrowDown size={15} /></button></div></li>)}</ol>
      <div className="mb-question-actions"><button className="mb-primary-button" onClick={checkOrder}><Check size={15} />Check order</button><button onClick={() => { setOrder([processOrder[2], processOrder[0], processOrder[3], processOrder[1]]); setOrderFeedback(null); }}><RotateCcw size={14} />Reset challenge</button></div>
      {orderFeedback !== null && <div className={`mb-question-feedback ${orderFeedback ? "correct" : "wrong"}`} role="status"><strong>{orderFeedback ? "Correct sequence" : "Not quite yet"}</strong><p>DNA opens, a primer is placed, polymerase extends new strands, and two DNA molecules form. Real replication also uses additional proteins and coordinated leading- and lagging-strand synthesis.</p></div>}
    </div>}
  </section>;
}
