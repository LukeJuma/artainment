import { useState, useEffect } from 'react'
import { homeAPI, type HomeData } from '../lib/api'
import { HeroSection } from '../components/home/HeroSection'
import { WhoWeAre } from '../components/home/WhoWeAre'
import { FeaturedProduction } from '../components/home/FeaturedProduction'
import { FilmsCarousel } from '../components/home/FilmsCarousel'
import { PodcastSection } from '../components/home/PodcastSection'
import { ComingSoonSection } from '../components/home/ComingSoonSection'
import { TalentSection } from '../components/home/TalentSection'
import { NewsSection } from '../components/home/NewsSection'
import { CTASection } from '../components/home/CTASection'

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  useEffect(() => { 
    homeAPI.get()
      .then(setData)
      .catch(error => {
        console.error('Failed to load homepage data:', error);
        setData(null);
      })
  }, [])

  const films = data?.films ?? []
  const series = data?.series ?? []
  const talent = data?.talent ?? []
  const news = data?.news ?? []
  const podcasts = data?.podcasts ?? []
  const comingSoon = data?.coming_soon ?? []

  const featured = data?.featured_film ?? null
  // A series flagged `featured` (e.g. Mboka) takes the featured slot so it
  // appears in the hero rotation, the carousel and the featured banner.
  // Unflag it in the database to restore the film-first order.
  const featuredSeries = series.find(s => s.featured) ?? null
  const featuredProduction = featuredSeries ?? featured ?? series[0] ?? films[0] ?? null
  // Reference equality avoids film/series id collisions across tables
  const featuredKind: 'film' | 'series' =
    featuredProduction !== null && (featuredProduction === featuredSeries || (!featured && featuredProduction === series[0]))
      ? 'series'
      : 'film'

  return (
    <>
      <HeroSection films={films} series={series} featured={featuredProduction} featuredKind={featuredKind} />
      <FilmsCarousel films={films} series={series} />
      <FeaturedProduction film={featuredProduction} kind={featuredKind} />
      <ComingSoonSection films={comingSoon} />
      <WhoWeAre />
      <TalentSection talent={talent} />
      <PodcastSection podcasts={podcasts} />
      <NewsSection news={news} />
      <CTASection />
    </>
  )
}
