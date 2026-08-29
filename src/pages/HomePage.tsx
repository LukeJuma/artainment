import { useState, useEffect } from 'react'
import { homeAPI, type HomeData } from '../lib/api'
import { HeroSection } from '../components/home/HeroSection'
import { WhoWeAre } from '../components/home/WhoWeAre'
import { FeaturedProduction } from '../components/home/FeaturedProduction'
import { FilmsCarousel } from '../components/home/FilmsCarousel'
import { PodcastSection } from '../components/home/PodcastSection'
import { ComingSoonSection } from '../components/home/ComingSoonSection'
import { TalentSection } from '../components/home/TalentSection'
import { GallerySection } from '../components/home/GallerySection'
import { NewsSection } from '../components/home/NewsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { CTASection } from '../components/home/CTASection'

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  useEffect(() => { homeAPI.get().then(setData).catch(() => {}) }, [])

  const films = data?.films ?? []
  const talent = data?.talent ?? []
  const gallery = data?.gallery ?? []
  const news = data?.news ?? []
  const testimonials = data?.testimonials ?? []
  const podcasts = data?.podcasts ?? []
  const comingSoon = data?.coming_soon ?? []

  const featured = data?.featured_film ?? null
  const featuredProduction = featured ?? (films.find(f => f.backdrop_url || f.poster_url) ?? films[0] ?? null)

  return (
    <>
      <HeroSection films={films} featured={featured} />
      <FilmsCarousel films={films} />
      <FeaturedProduction film={featuredProduction} />
      <ComingSoonSection films={comingSoon} />
      <WhoWeAre />
      <TalentSection talent={talent} />
      <PodcastSection podcasts={podcasts} />
      <GallerySection images={gallery} />
      <NewsSection news={news} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
    </>
  )
}
