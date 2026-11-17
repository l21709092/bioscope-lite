
const RCSB_SEARCH_URL =
  "https://search.rcsb.org/rcsbsearch/v2/query";

const RCSB_DATA_URL =
  "https://data.rcsb.org/rest/v1/core/entry";

const RCSB_DOWNLOAD_URL =
  "https://files.rcsb.org/download";

const MAX_PAGE_SIZE = 100;

function validatePdbId(pdbId) {
  return /^[0-9][A-Za-z0-9]{3}$/.test(pdbId);
}

function normaliseEntry(entry) {
  const pdbId = entry.identifier;

  return {
    id: `rcsb-${pdbId}`,
    title: pdbId,
    description: "",
    source: "RCSB Protein Data Bank",
    sourceId: pdbId,
    sourceUrl: `https://www.rcsb.org/structure/${pdbId}`,
    format: "cif",
    modelUrl: `${RCSB_DOWNLOAD_URL}/${pdbId}.cif`,
    thumbnailUrl: "",
    scientificStatus: "experimental",
    organism: "Unknown",
    experimentalMethod: "Unknown",
    resolution: null,
    license: "CC0",
    attribution: "RCSB Protein Data Bank",
  };
}

export async function searchRCSB(
  searchTerm,
  limit = 20,
  start = 0
) {
  if (!searchTerm?.trim()) return [];

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    MAX_PAGE_SIZE
  );

  const safeStart = Math.max(Number(start) || 0, 0);

  const body = {
    query: {
      type: "terminal",
      service: "full_text",
      parameters: {
        value: searchTerm.trim(),
      },
    },
    return_type: "entry",
    request_options: {
      paginate: {
        start: safeStart,
        rows: safeLimit,
      },
      results_content_type: ["experimental"],
      sort: [
        {
          sort_by: "score",
          direction: "desc",
        },
      ],
    },
  };

  const response = await fetch(RCSB_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 204) return [];

  if (response.status === 429) {
    throw new Error("RCSB rate limit reached. Try again shortly.");
  }

  if (!response.ok) {
    throw new Error(
      `RCSB search failed with status ${response.status}`
    );
  }

  const data = await response.json();

  return (data.result_set || []).map(normaliseEntry);
}

export async function getRCSBDetails(pdbId) {
  const id = String(pdbId || "").toUpperCase();

  if (!validatePdbId(id)) {
    throw new Error("Invalid PDB identifier.");
  }

  const response = await fetch(
    `${RCSB_DATA_URL}/${id}`
  );

  if (response.status === 404) {
    throw new Error("Structure not found in RCSB.");
  }

  if (response.status === 429) {
    throw new Error("RCSB rate limit reached.");
  }

  if (!response.ok) {
    throw new Error("Could not retrieve RCSB metadata.");
  }

  const data = await response.json();

  return {
    id,
    title: data.struct?.title || id,
    experimentalMethod:
      data.exptl?.map((item) => item.method).filter(Boolean) || [],
    organism:
      data.rcsb_entity_source_organism?.map(
        (item) => item.scientific_name
      ).filter(Boolean) || [],
    resolution:
      data.rcsb_entry_info?.resolution_combined?.[0] ?? null,
    releaseDate:
      data.rcsb_accession_info?.initial_release_date ?? null,
    sourceUrl: `https://www.rcsb.org/structure/${id}`,
    license: "CC0",
  };
}

export function getRCSBModelUrl(pdbId, format = "cif") {
  const id = String(pdbId || "").toUpperCase();

  if (!validatePdbId(id)) {
    throw new Error("Invalid PDB identifier.");
  }

  const supportedFormats = {
    cif: `${id}.cif`,
    pdb: `${id}.pdb`,
    bcif: `${id}.bcif`,
  };

  const filename = supportedFormats[format.toLowerCase()];

  if (!filename) {
    throw new Error("Unsupported RCSB structure format.");
  }

  return `${RCSB_DOWNLOAD_URL}/${filename}`;
}
