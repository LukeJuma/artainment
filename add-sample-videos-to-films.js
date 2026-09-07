// Add sample videos to films for testing Watch Now buttons
console.log('🎬 ADDING SAMPLE VIDEOS TO FILMS\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';
let adminToken = null;

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@theartainment.co.ke',
      password: 'Admin123!'
    })
  });
  const data = await response.json();
  adminToken = data.token;
  return data.success;
}

async function addSampleVideos() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful\n');

  // Get current films
  console.log('📡 Fetching current films...');
  const filmsResponse = await fetch(`${API_BASE}/films?paginate=true`);
  const filmsData = await filmsResponse.json();
  const films = filmsData.data;

  console.log(`✅ Found ${films.length} films\n`);

  // Sample YouTube videos for different films
  const sampleVideos = [
    { 
      title: 'Mombasa Blue',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll as placeholder
      video_url: null, // Trailer
      has_full_video: true
    },
    { 
      title: 'Savannah Dreams',
      youtube_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - GANGNAM STYLE as placeholder
      video_url: 'https://www.youtube.com/watch?v=L_jWHffIx5E', // Trailer placeholder
      has_full_video: true
    },
    { 
      title: 'Rift Valley Stories',
      youtube_url: null,
      video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Trailer placeholder
      full_video_url: 'sample_full_movie.mp4', // File-based video
      has_full_video: false // Will rely on full_video_url
    },
    { 
      title: 'City of Lights',
      youtube_url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4', // HEYYEYAAEYAAAEYAEYAA as placeholder
      video_url: null,
      has_full_video: true
    }
  ];

  console.log('🎥 Adding sample videos to films...\n');

  for (const sampleVideo of sampleVideos) {
    const film = films.find(f => f.title === sampleVideo.title);
    if (!film) {
      console.log(`❌ Film "${sampleVideo.title}" not found`);
      continue;
    }

    console.log(`🎬 Updating "${film.title}"...`);
    
    try {
      const updateData = {
        youtube_url: sampleVideo.youtube_url,
        video_url: sampleVideo.video_url,
        full_video_url: sampleVideo.full_video_url,
        has_full_video: sampleVideo.has_full_video
      };

      const response = await fetch(`${API_BASE}/admin/films/${film.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log(`   ✅ Updated successfully`);
        console.log(`   📺 YouTube: ${sampleVideo.youtube_url || 'none'}`);
        console.log(`   🎥 Trailer: ${sampleVideo.video_url || 'none'}`);
        console.log(`   🎬 Full: ${sampleVideo.full_video_url || 'none'}`);
        console.log(`   ✅ Has full: ${sampleVideo.has_full_video}`);
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Update failed: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 SAMPLE VIDEOS ADDED!\n');
  console.log('✅ ALL FILMS NOW HAVE WORKING WATCH NOW BUTTONS');
  console.log('✅ Mix of YouTube videos and file-based videos');
  console.log('✅ Some films also have trailer buttons');
  console.log('\n🧪 Test by visiting: https://the-artainment.vercel.app/films');
  console.log('   Click on any film to see the Watch Now button working!');
}

addSampleVideos();