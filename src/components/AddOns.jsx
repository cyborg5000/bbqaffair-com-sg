import { staticAddOns as addOns } from '../data/menu';

function AddOns() {
  // Temporarily hidden per request.
  const isHidden = true;
  if (isHidden) return null;

  return (
    <section className="addons-section">
      <h2 className="section-title">Add-On Services</h2>
      <p className="section-subtitle">
        Enhance your BBQ experience with these optional add-ons
      </p>
      
      <div className="addons-grid">
        {addOns.map((addon, index) => (
          <div key={index} className="addon-card">
            <h4>{addon.name}</h4>
            <div className="addon-price">{addon.price}</div>
            <p>{addon.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AddOns;
