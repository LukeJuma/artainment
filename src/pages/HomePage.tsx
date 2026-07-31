import { useState, useEffect } from 'react'
import { homeAPI, type HomeData } from '../lib/api'
import { HeroSection } from '../components/home/HeroSection'
import { WhoWeAre } from '../components/home/WhoWeAre'
import { FeaturedProduction } from '../components/home/FeaturedProduction'
import { ServicesSection } from '../components/home/ServicesSection'
import { FilmsCarousel } from '../components/home/FilmsCarousel'
import { TalentSection } from '../components/home/TalentSection'
import { GallerySection } from '../components/home/GallerySection'
import { NewsSection } from '../components/home/NewsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { CTASection } from '../components/home/CTASection'

export function HomePage() {
  const [featured, setFeatured] = useState<any>(null)
  useEffect(() => { homeAPI.get().then(d => setFeatured(d.featured_film)).catch(() => {}) }, [])
  return (
    <>
      <HeroSection />
      <WhoWeAre />
      <FeaturedProduction film={featured} />
      <ServicesSection />
      <FilmsCarousel />
      <TalentSection />
      <GallerySection />
      <NewsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
