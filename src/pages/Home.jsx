import Hero from '../components/Hero';
import VisionMission from '../components/VisionMission';
import MenuSection from '../components/MenuSection';
import AddOns from '../components/AddOns';
import AboutSection from '../components/AboutSection';
import Testimonials from '../components/Testimonials';
import Partners from '../components/Partners';

function Home() {
  return (
    <>
      <Hero />
      <VisionMission />
      <MenuSection />
      <Partners />
      <AddOns />
      <AboutSection />
      <Testimonials />
    </>
  );
}

export default Home;
