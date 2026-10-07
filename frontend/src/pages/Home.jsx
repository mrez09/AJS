import BuyerCTA from '../components/BuyerCTA.jsx'
import Capabilities from '../components/Capabilities.jsx'
import CommodityPreview from '../components/CommodityPreview.jsx'
import CompanyOverview from '../components/CompanyOverview.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/Hero.jsx'
import Navbar from '../components/Navbar.jsx'
import SourcingAndTraction from '../components/SourcingAndTraction.jsx'
import WhyAJS from '../components/WhyAJS.jsx'

function Home() {
  return (
    <div id="home" className="min-h-screen overflow-hidden bg-white text-[#102b45]">
      <Navbar />
      <main>
        <Hero />
        <CompanyOverview />
        <Capabilities />
        <CommodityPreview />
        <SourcingAndTraction />
        <WhyAJS />
        <BuyerCTA />
      </main>
      <Footer />
    </div>
  )
}

export default Home
