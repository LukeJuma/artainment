// Test podcast episodes API fix
const API_URL = 'https://kvlvqnkpbzexgzjmfidg.supabase.co/functions/v1/api'

async function testPodcastsAPI() {
  console.log('Testing podcasts API...')
  
  try {
    // Test podcasts list
    const listResponse = await fetch(`${API_URL}/podcasts`)
    const podcasts = await listResponse.json()
    console.log('Podcasts list:', podcasts.length > 0 ? `Found ${podcasts.length} podcasts` : 'No podcasts found')
    
    if (podcasts.length > 0) {
      const firstPodcast = podcasts[0]
      console.log('First podcast:', firstPodcast.title)
      console.log('Episodes included?', firstPodcast.podcast_episodes ? `Yes, ${firstPodcast.podcast_episodes.length} episodes` : 'No episodes')
      
      // Test individual podcast
      const detailResponse = await fetch(`${API_URL}/podcasts/${firstPodcast.slug}`)
      const podcastDetail = await detailResponse.json()
      console.log('Podcast detail episodes:', podcastDetail.podcast_episodes ? `${podcastDetail.podcast_episodes.length} episodes` : 'No episodes')
    }
    
  } catch (error) {
    console.error('API test failed:', error.message)
  }
}

testPodcastsAPI()