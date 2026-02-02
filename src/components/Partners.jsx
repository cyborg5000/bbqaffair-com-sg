function Partners() {
  const partners = [
    { name: 'BBQ Warung Guys', logo: '/partners/bbq-warung-guys.png' },
    { name: 'Grandmama Theresa', logo: '/partners/grandmama-theresa.png' },
    { name: 'Party Affairs', logo: '/partners/party-affairs.png' },
    { name: 'Purely BBQ', logo: '/partners/purely-bbq.png' },
  ];

  return (
    <section className="partners-section">
      <div className="partners-content">
        <span className="partners-tagline">Trusted By</span>
        <h2 className="section-title">Our Partners</h2>
        <p className="section-subtitle">
          Proud to work alongside Singapore's finest in food and events
        </p>

        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-logo">
              <img src={partner.logo} alt={partner.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Partners;
