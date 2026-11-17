
import { useEffect, useState } from "react";

import { MOLECULAR_CATEGORIES } from "../../data/molecularcategories";
import {
  searchMolecularModelsDetailed,
} from "../../services/molecularsearch";

import MolecularCategories from "./molecularcategories";
import MolecularSearch from "./molecularsearch";
import MolecularModelCard from "./molecularmodelcard";
import MolecularViewer from "./molecularviewer";
import ChemicalViewer from "./chemicalviewer";
import MolecularDetails from "./moleculardetails";
import MolecularLearningPanel from ".molecularlearningpanel";
import MolecularBookmarks from "./molecularbookmarks";

import "../../styles/molecular.css";

export default function MolecularBiology() {
  const [activeCategory, setActiveCategory] = useState("dna");
  const [searchTerm, setSearchTerm] = useState("DNA");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceErrors, setSourceErrors] = useState([]);

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("bioscope-molecular-bookmarks") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [recentModels, setRecentModels] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("bioscope-molecular-history") || "[]"
      );
    } catch {
      return [];
    }
  });

  const category = MOLECULAR_CATEGORIES.find(
    (item) => item.id === activeCategory
  );

  useEffect(() => {
    localStorage.setItem(
      "bioscope-molecular-bookmarks",
      JSON.stringify(bookmarks)
    );
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(
      "bioscope-molecular-history",
      JSON.stringify(recentModels)
    );
  }, [recentModels]);

  async function handleSearch(event) {
    if (event) event.preventDefault();

    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");
    setSourceErrors([]);
    setModels([]);
    setSelectedModel(null);

    try {
      const result = await searchMolecularModelsDetailed(
        searchTerm,
        activeCategory,
        20
      );

      setModels(result.models);
      setSourceErrors(result.errors);

      if (result.models.length === 0) {
        setError("No matching structures were found.");
      }
    } catch (err) {
      console.error("Molecular search error:", err);
      setError("The molecular databases could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  function handleCategorySelect(categoryId) {
    setActiveCategory(categoryId);
    setModels([]);
    setSelectedModel(null);
    setError("");
    setSourceErrors([]);

    const newCategory = MOLECULAR_CATEGORIES.find(
      (item) => item.id === categoryId
    );

    setSearchTerm(newCategory?.name || "");
  }

  function handleSelectModel(model) {
    setSelectedModel(model);

    setRecentModels((previous) => [
      model,
      ...previous.filter((item) => item.id !== model.id),
    ].slice(0, 15));
  }

  function toggleBookmark(model) {
    setBookmarks((previous) => {
      const alreadySaved = previous.some(
        (item) => item.id === model.id
      );

      if (alreadySaved) {
        return previous.filter((item) => item.id !== model.id);
      }

      return [model, ...previous];
    });
  }

  const isBookmarked = selectedModel
    ? bookmarks.some((item) => item.id === selectedModel.id)
    : false;

  return (
    <main className="molecular-page">

      <header className="molecular-heading">
        <span>BIOSCOPE / BIOLOGY / MOLECULAR BIOLOGY</span>
        <h1>Molecular Biology</h1>
        <p>
          Explore the molecular structures and machinery
          that make life possible.
        </p>
      </header>

      <MolecularCategories
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />

      <section className="molecular-topic-section">
        <h2>{category?.name}</h2>
        <p>{category?.description}</p>

        <div className="molecular-subcategories">
          {category?.subcategories.map((topic) => (
            <button
              key={topic}
              onClick={() => setSearchTerm(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <MolecularSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && (
        <p className="molecular-error">{error}</p>
      )}

      {sourceErrors.length > 0 && (
        <div className="molecular-source-errors">
          <strong>Some databases could not be reached:</strong>

          {sourceErrors.map((item) => (
            <p key={item.provider}>
              {item.provider}: {item.message}
            </p>
          ))}
        </div>
      )}

      <section className="molecular-results">
        {models.map((model) => (
          <MolecularModelCard
            key={model.id}
            model={model}
            selected={selectedModel?.id === model.id}
            onSelect={handleSelectModel}
          />
        ))}
      </section>

      {selectedModel && (
        <section className="molecular-explorer">

          <div className="molecular-explorer-main">

            <div className="molecular-explorer-heading">
              <h2>{selectedModel.title}</h2>

              <button
                onClick={() => toggleBookmark(selectedModel)}
              >
                {isBookmarked
                  ? "Remove bookmark"
                  : "Save structure"}
              </button>
            </div>

            {selectedModel.format === "cif" ||
            selectedModel.format === "pdb" ? (
              <MolecularViewer model={selectedModel} />
            ) : selectedModel.format === "sdf" ? (
              <ChemicalViewer model={selectedModel} />
            ) : (
              <div className="viewer-status">
                No compatible 3D renderer is available.
              </div>
            )}

            <MolecularLearningPanel model={selectedModel} />

          </div>

          <MolecularDetails model={selectedModel} />

        </section>
      )}

      <MolecularBookmarks
        bookmarks={bookmarks}
        recentModels={recentModels}
        onSelect={handleSelectModel}
      />

    </main>
  );
}
