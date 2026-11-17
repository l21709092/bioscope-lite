
const UNIPROT_SEARCH =
  "https://rest.uniprot.org/uniprotkb/search";

const ALPHAFOLD_API =
  "https://alphafold.ebi.ac.uk/api/prediction";

export async function searchAlphaFold(searchTerm, limit = 10) {
  if (!searchTerm?.trim()) return [];

  const url = new URL(UNIPROT_SEARCH);

  url.searchParams.set("query", searchTerm.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("size", String(limit));
  url.searchParams.set(
    "fields",
    "accession,protein_name,organism_name"
  );

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("UniProt rate limit reached.");
  }

  if (!response.ok) {
    throw new Error("Could not search UniProt.");
  }

  const data = await response.json();

  const proteins = data.results || [];

  const results = await Promise.all(
    proteins.map(async (protein) => {
      const accession = protein.primaryAccession;

      try {
        const predictionResponse = await fetch(
          `${ALPHAFOLD_API}/${encodeURIComponent(accession)}`
        );

        if (!predictionResponse.ok) return null;

        const predictions = await predictionResponse.json();
        const model = predictions[0];

        if (!model?.cifUrl) return null;

        const proteinName =
          protein.proteinDescription
            ?.recommendedName
            ?.fullName
            ?.value || accession;

        return {
          id: `alphafold-${accession}`,
          title: proteinName,
          description: "AI-predicted protein structure.",
          source: "AlphaFold Database",
          sourceId: accession,
          organism:
            protein.organism?.scientificName || "Unknown",
          format: "cif",
          modelUrl: model.cifUrl,
          sourceUrl:
            `https://alphafold.ebi.ac.uk/entry/${accession}`,
          scientificStatus: "predicted",
          confidenceUrl: model.confidenceDocUrl || null,
          license: "CC-BY-4.0",
          attribution: "AlphaFold Protein Structure Database",
        };
      } catch (error) {
        console.error(
          `AlphaFold lookup failed for ${accession}:`,
          error
        );
        return null;
      }
    })
  );

  return results.filter(Boolean);
}
