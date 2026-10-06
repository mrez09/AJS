import BuyerCTA from '../components/BuyerCTA.jsx'
import Capabilities from '../components/Capabilities.jsx'
import CommodityPreview from '../components/CommodityPreview.jsx'
import Footer from '../components/Footer.jsx'
import Hero from '../components/Hero.jsx'
import Navbar from '../components/Navbar.jsx'

function Home() {
  return (
    <div id="home" className="min-h-screen overflow-hidden bg-white text-[#102b45]">
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <CommodityPreview />
        <BuyerCTA />
      </main>
      <Footer />
    </div>
  )
}

export default Home
