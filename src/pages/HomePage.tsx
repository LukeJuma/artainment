import { useState, useEffect } from 'react'
import { homeAPI, type HomeData } from '../lib/api'
import { Loader } from '../components/ui/Loader'
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
  const [data, setData] = useState<HomeData | null>(null)
  useEffect(() => { homeAPI.get().then(setData).catch(() => {}) }, [])
  if (!data) return <Loader />
  return (
    <>
      <HeroSection />
      <WhoWeAre />
      <FeaturedProduction film={data.featured_film} />
      <ServicesSection services={data.services} />
      <FilmsCarousel />
      <TalentSection talent={data.talent} />
      <GallerySection images={data.gallery} />
      <NewsSection news={data.news} />
      <TestimonialsSection testimonials={data.testimonials} />
      <CTASection />
    </>
  )
}
