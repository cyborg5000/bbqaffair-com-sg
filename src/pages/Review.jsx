import ReviewForm from '../components/ReviewForm';

function Review() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <section
        style={{
          background: 'linear-gradient(rgba(25, 18, 14, 0.88), rgba(25, 18, 14, 0.88)), url("/images/meat-platter.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Customer Reviews</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '620px', margin: '0 auto', opacity: 0.9 }}>
          Tell us how we did and share your BBQ moments.
        </p>
      </section>

      <ReviewForm />
    </div>
  );
}

export default Review;
