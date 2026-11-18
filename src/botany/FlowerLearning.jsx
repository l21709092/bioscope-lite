import { useState } from "react";
import { Activity, ArrowDown, ArrowRight, Bug, Droplet, Flower2, Leaf, ShieldCheck, Sparkles, Zap } from "lucide-react";

const cards = [
  {
    id: "flower-organs", title: "Male vs. female parts", hook: "StaMEN = Male · Pistil = Queen of the Castle", tag: "TWO REPRODUCTIVE ORGANS", theme: "organs", badges: [[Activity, "gold"], [Flower2, "rose"]], targetId: "anther",
    visual: <div className="botany-learning-organ-compare">
      <div className="male-organ"><span className="organ-badge">MALE · STAMEN</span><strong>Anther + Filament</strong><small>Anther makes pollen; filament supports it.</small></div>
      <div className="female-organ"><span className="organ-badge">FEMALE · PISTIL / CARPEL</span><strong>Stigma + Style + Ovary</strong><small>Receives pollen and contains ovules.</small></div>
    </div>,
    explanation: "StaMEN helps remember that the stamen is the male reproductive organ. It is made of an anther, which produces pollen, and a filament, which holds the anther. The pistil (carpel) is the female organ: stigma, style and ovary. A flower can have one or many carpels, sometimes fused together."
  },
  {
    id: "pistil-order", title: "Pistil order, top to bottom", hook: "SSO: Sticky Stigma, Long Style, Round Ovary", tag: "TRACE THE POLLEN TUBE", theme: "pathway", badges: [[ArrowDown, "green"]], targetId: "stigma",
    visual: <div className="botany-learning-pistil-path"><div><b>STIGMA</b><span>Sticky surface catches pollen</span></div><ArrowDown /><div><b>STYLE</b><span>Pollen tube grows down</span></div><ArrowDown /><div><b>OVARY</b><span>Holds the ovules</span></div></div>,
    explanation: "Pollen lands on a compatible stigma. It can germinate and grow a pollen tube down through the style. The tube reaches an ovule inside the ovary and delivers sperm cells. SSO gives the order from the flower’s top toward its base."
  },
  {
    id: "anther", title: "What happens in an anther?", hook: "Anther = Pollen Factory", tag: "GOLD POLLEN DUST", theme: "anther", badges: [[Sparkles, "gold"], [Droplet, "yellow"]], targetId: "anther",
    visual: <div className="botany-learning-pollen"><div className="pollen-dust">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div><div><strong>Inside the pollen sacs</strong><span>Microsporocyte → meiosis → microspores → pollen grains</span></div></div>,
    explanation: "Inside the anther lobes are pollen sacs (microsporangia). Diploid microsporocytes undergo meiosis to make haploid microspores. Each microspore develops into a pollen grain, the male gametophyte."
  },
  {
    id: "sepals-petals", title: "Sepals vs. petals", hook: "Sepals Shield the Bud · Petals Pull Pollinators", tag: "PROTECT THEN ATTRACT", theme: "whorls", badges: [[ShieldCheck, "green"], [Bug, "rose"]], targetId: "sepal",
    visual: <div className="botany-learning-whorls"><div><ShieldCheck /><b>SEPAL</b><span>Green shield protects the bud before it opens.</span></div><ArrowRight /><div><Flower2 /><b>PETAL</b><span>Color and scent can attract pollinators.</span></div></div>,
    explanation: "Sepals are the outer floral whorl and commonly protect the flower while it is a bud. Petals form the corolla; their colors, patterns and scents can attract insect or bird pollinators. These features vary widely among flowering plants."
  },
  {
    id: "fruit-and-seed", title: "What becomes fruit and seed?", hook: "Ovule → Seed · Ovary → Fruit", tag: "FOLLOW THE TRANSFORMATION", theme: "transform", badges: [[Leaf, "green"], [ArrowRight, "gold"]], targetId: "ovule",
    visual: <div className="botany-learning-transform"><div><span className="transform-icon ovule-icon"><CircleSeed /></span><b>OVULE</b></div><ArrowRight /><div><span className="transform-icon seed-icon"><Flower2 /></span><b>SEED</b></div><i className="transform-divider" /><div><span className="transform-icon ovary-icon"><Flower2 /></span><b>OVARY</b></div><ArrowRight /><div><span className="transform-icon fruit-icon"><Sparkles /></span><b>FRUIT</b></div></div>,
    explanation: "After fertilization, an ovule usually develops into a seed containing the embryo. The ovary often develops into a fruit that surrounds or helps disperse the seeds. In some plants, other flower tissues also contribute to the fruit."
  },
  {
    id: "double-fertilization", title: "Double fertilization", hook: "Two Sperm · Two Fusions · Two Results", tag: "ANGIOSPERM SPECIAL", theme: "fertilization", badges: [[Zap, "yellow"], [Sparkles, "rose"]], targetId: "ovule",
    visual: <div className="botany-learning-double"><div><span>1</span><strong>Sperm + egg</strong><ArrowRight /><b>Zygote</b><small>Begins the embryo</small></div><div><span>2</span><strong>Sperm + polar nuclei</strong><ArrowRight /><b>Endosperm</b><small>Food tissue for the embryo</small></div></div>,
    explanation: "The pollen tube delivers two sperm cells. One fuses with the egg to form a zygote, which develops into the embryo. The other fuses with the central cell, which usually contains two polar nuclei, to start endosperm development. Because two fusion events happen, it is called double fertilization."
  }
];

function CircleSeed() {
  return <span className="botany-learning-seed-shape" aria-hidden="true"><i /></span>;
}

export default function FlowerLearning({ onJump }) {
  const [revealed, setRevealed] = useState({});
  return <section className="botany-learning-panel">
    <div className="botany-learning-intro"><span className="botany-eyebrow">FLOWER LEARNING · MEMORY TOOLKIT</span><h2>Remember the parts, follow the process</h2><p>Start with the hook, try to recall what it means, then reveal the biology. Jump to the 3D explorer to inspect each structure.</p></div>
    <div className="botany-learning-grid">
      {cards.map(card => {
        const open = Boolean(revealed[card.id]);
        return <article key={card.id} className={`botany-learning-card ${card.theme}`}>
          <header className="botany-learning-card-head">
            <span className="botany-learning-badges" aria-label={card.tag}>{card.badges.map(([Icon, color], index) => <i key={index} className={color}><Icon size={15} /></i>)}</span>
            <div><span className="botany-learning-tag">{card.tag}</span><h3>{card.title}</h3></div>
          </header>
          <div className="botany-mnemonic-callout"><span>MEMORY HOOK</span><strong>{card.hook}</strong></div>
          <div className="botany-learning-visual">{card.visual}</div>
          <button type="button" className="botany-reveal-button" aria-expanded={open} onClick={() => setRevealed(previous => ({ ...previous, [card.id]: !previous[card.id] }))}>
            <span>{open ? "Quick Recall · Hide explanation" : "Quick Recall · Reveal why"}</span><b>{open ? "−" : "+"}</b>
          </button>
          {open && <div className="botany-learning-explanation" aria-live="polite"><strong>What the hook means</strong><p>{card.explanation}</p></div>}
          <button type="button" className="botany-jump-button" onClick={() => onJump(card.targetId)}><span>Jump to 3D Structure</span><ArrowRight size={15} /></button>
        </article>;
      })}
    </div>
  </section>;
}
