
import { searchRCSB } from "./rcsbservice";
import { searchAlphaFold } from "./alphafoldservice";
import { searchPubChem } from "./pubchemservice";

const SEARCH_PROVIDERS = {
  dna: ["rcsb"],
  rna: ["rcsb"],
  proteins: ["rcsb", "alphafold"],
  enzymes: ["rcsb", "alphafold"],
  complexes: ["rcsb"],
  metabolites: ["pubchem"],
  all: ["rcsb", "alphafold", "pubchem"],
};

const PROVIDER_FUNCTIONS = {
  rcsb: searchRCSB,
  alphafold: searchAlphaFold,
  pubchem: searchPubChem,
};

function normaliseText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function deduplicateModels(models) {
  const unique = new Map();

  for (const model of models) {
    if (!model?.id || !model?.modelUrl) continue;

    const key = `${normaliseText(model.source)}:${normaliseText(
      model.sourceId
    )}`;

    if (!unique.has(key)) {
      unique.set(key, model);
    }
  }

  return [...unique.values()];
}

function rankModels(models, searchTerm) {
  const query = normaliseText(searchTerm);

  return [...models].sort((a, b) => {
    const aTitle = normaliseText(a.title);
    const bTitle = normaliseText(b.title);

    const aExact = aTitle === query ? 1 : 0;
    const bExact = bTitle === query ? 1 : 0;

    const aMatch = aTitle.includes(query) ? 1 : 0;
    const bMatch = bTitle.includes(query) ? 1 : 0;

    return bExact - aExact || bMatch - aMatch;
  });
}

export async function searchMolecularModelsDetailed(
  searchTerm,
  category = "all",
  limit = 20
) {
  const query = String(searchTerm || "").trim();

  if (!query) {
    return {
      models: [],
      errors: [],
    };
  }

  const selectedCategory = SEARCH_PROVIDERS[category]
    ? category
    : "all";

  const providers = SEARCH_PROVIDERS[selectedCategory];

  const jobs = providers.map(async (provider) => {
    try {
      const searchFunction = PROVIDER_FUNCTIONS[provider];

      const results = await searchFunction(query, limit);

      return {
        provider,
        results: Array.isArray(results) ? results : [],
        error: null,
      };
    } catch (error) {
      console.error(`${provider} search failed:`, error);

      return {
        provider,
        results: [],
        error: error.message || "Search failed",
      };
    }
  });

  const providerResults = await Promise.all(jobs);

  const models = providerResults.flatMap(
    (result) =>
        result.results.map((model) => ({
            ...model,
            category: selectedCategory,
        }))
    );

  const errors = providerResults
    .filter((result) => result.error)
    .map((result) => ({
      provider: result.provider,
      message: result.error,
    }));

  return {
    models: rankModels(
      deduplicateModels(models),
      query
    ),
    errors,
  };
}

// Compatibility function for components that expect an array.
export async function searchMolecularModels(
  searchTerm,
  category = "all",
  limit = 20
) {
  const result = await searchMolecularModelsDetailed(
    searchTerm,
    category,
    limit
  );

  return result.models;
}
