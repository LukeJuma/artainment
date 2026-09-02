    
    // HOME PAGE DATA
    if (path === '/home' && method === 'GET') {
      try {
        const [
          { data: featuredFilm }, { data: films }, { data: services },
          { data: talent }, { data: gallery }, { data: news },
          { data: testimonials }, { data: podcasts }, { data: comingSoon }
        ] = await Promise.all([
          supabase.from('films').select('*').eq('featured', true).eq('status', 'completed').limit(1).single(),
          supabase.from('films').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(8),
          supabase.from('services').select('*').eq('active', true).order('sort_order'),
          supabase.from('talent').select('*').eq('active', true).order('sort_order').limit(6),
          supabase.from('gallery_images').select('*').order('sort_order').limit(8),
          supabase.from('news_articles').select('*').eq('status', 'published').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(4),
          supabase.from('testimonials').select('*').eq('active', true).order('sort_order'),
          supabase.from('podcasts').select('*').eq('active', true).order('sort_order').limit(4),
          supabase.from('films').select('*').in('status', ['upcoming', 'in_production']).order('release_date').limit(4)
        ])

        return new Response(JSON.stringify({
          featured_film: featuredFilm || null, films: films || [], services: services || [],
          talent: talent || [], gallery: gallery || [], news: news || [],
          testimonials: testimonials || [], podcasts: podcasts || [], coming_soon: comingSoon || []
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load home data', details: error.message }),
          { status: 500, headers: corsHeaders })
      }
    }

    // FILMS ENDPOINTS
    if (path === '/films' && method === 'GET') {
      try {
        const genre = url.searchParams.get('genre')
        const paginate = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 10

        let query = supabase.from('films').select('*').eq('status', 'completed').order('sort_order')
        if (genre && genre !== 'All') query = query.eq('genre', genre)

        const { data: films, error } = await query
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })

        if (paginate) {
          const total = films?.length || 0
          const startIndex = (page - 1) * perPage
          const paginatedData = films?.slice(startIndex, startIndex + perPage) || []
          
          return new Response(JSON.stringify({
            data: paginatedData, current_page: page, last_page: Math.ceil(total / perPage),
            per_page: perPage, total: total
          }), { headers: corsHeaders })
        }

        return new Response(JSON.stringify(films || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load films', details: error.message }),
          { status: 500, headers: corsHeaders })
      }
    }