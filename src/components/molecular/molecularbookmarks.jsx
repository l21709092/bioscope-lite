
export default function MolecularBookmarks({
  bookmarks = [],
  recentModels = [],
  onSelect,
}) {
  return (
    <section className="molecular-saved-section">

      <div className="molecular-saved-group">
        <h2>Saved structures</h2>

        {bookmarks.length === 0 ? (
          <p>You haven't saved any structures yet.</p>
        ) : (
          <div className="molecular-saved-list">
            {bookmarks.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
              >
                <strong>{model.title}</strong>
                <small>{model.source}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="molecular-saved-group">
        <h2>Recently viewed</h2>

        {recentModels.length === 0 ? (
          <p>Your viewing history will appear here.</p>
        ) : (
          <div className="molecular-saved-list">
            {recentModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
              >
                <strong>{model.title}</strong>
                <small>{model.source}</small>
              </button>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
