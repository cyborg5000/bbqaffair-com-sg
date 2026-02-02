import { Eye, Target } from 'lucide-react';

function VisionMission() {
  return (
    <section className="vision-mission">
      <div className="vision-mission-grid">
        {/* Vision */}
        <div className="vision-card">
          <h3>
            <Eye size={28} />
            Our Vision
          </h3>
          <p>
            Singapore's top authority and destination for BBQ enthusiasts, renowned
            for our dedication to quality, authenticity, and customer satisfaction.
            We aim to inspire individuals to explore BBQ, fostering creativity,
            camaraderie, and culinary excellence. Through innovation and dedication,
            we elevate the BBQ experience, enriching lives and creating lasting memories.
          </p>
        </div>

        {/* Mission */}
        <div className="mission-card">
          <h3>
            <Target size={28} />
            Our Mission
          </h3>
          <p>
            We unite people with the joy of BBQ, crafting unforgettable experiences
            and delicious flavors that ignite the senses and nourish the soul.
            Dedicated to exceptional quality, passion, and innovation in every dish,
            we foster community and connection, one delicious bite at a time.
          </p>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
