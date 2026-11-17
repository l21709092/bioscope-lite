
const PUBCHEM =
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export async function searchPubChem(searchTerm, limit = 10) {
  if (!searchTerm?.trim()) return [];

  const searchUrl =
    `${PUBCHEM}/compound/name/` +
    `${encodeURIComponent(searchTerm.trim())}/cids/JSON`;

  const response = await fetch(searchUrl);

  if (response.status === 404) return [];

  if (response.status === 429) {
    throw new Error("PubChem rate limit reached.");
  }

  if (!response.ok) {
    throw new Error("PubChem search failed.");
  }

  const data = await response.json();

  const cids = (data.IdentifierList?.CID || []).slice(
    0,
    limit
  );

  return cids.map((cid) => ({
    id: `pubchem-${cid}`,
    title: `Compound CID ${cid}`,
    description: "Small molecule from PubChem.",
    source: "PubChem",
    sourceId: String(cid),
    format: "sdf",
    modelUrl:
      `${PUBCHEM}/compound/cid/${cid}/SDF?record_type=3d`,
    sourceUrl:
      `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    scientificStatus: "reference",
    license: "Check individual record/source",
    attribution: "PubChem",
  }));
}
