import Hero from '../components/Hero';
import StatsCards from '../components/StatsCards';
import DepartmentGrid from '../components/DepartmentGrid';
import FeaturedApps from '../components/FeaturedApps';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';

const Home = () => {
  return (
    <div>
      <Hero />
      <StatsCards />
      <DepartmentGrid />
      <FeaturedApps />
      <HowItWorks />
      <CTA />
    </div>
  );
};

export default Home;
