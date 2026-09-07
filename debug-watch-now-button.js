// Debug Watch Now button issue
console.log('🔍 DEBUGGING WATCH NOW BUTTON ISSUE\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function debugFilms() {
  try {
    console.log('📡 Fetching films from API...');
    const response = await fetch(`${API_BASE}/films?paginate=true`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', data.message);
      return;
    }

    const films = data.data;
    console.log(`✅ Found ${films.length} films\n`);

    console.log('🎬 FILMS ANALYSIS:\n');
    films.forEach((film, index) => {
      console.log(`${index + 1}. "${film.title}" (${film.slug})`);
      console.log(`   🎥 video_url: ${film.video_url ? '✅ YES' : '❌ NO'}`);
      console.log(`   🎬 full_video_url: ${film.full_video_url ? '✅ YES' : '❌ NO'}`);
      console.log(`   📺 has_full_video: ${film.has_full_video ? '✅ YES' : '❌ NO'}`);
      console.log(`   🔗 youtube_url: ${film.youtube_url ? '✅ YES' : '❌ NO'}`);
      
      // Check if Watch Now button should appear
      const hasFull = Boolean(film.has_full_video ?? film.full_video_url);
      const hasTrailer = Boolean(film.video_url);
      
      console.log(`   🎯 Watch Now button: ${hasFull ? '✅ SHOWS' : '❌ HIDDEN'}`);
      console.log(`   🎯 Watch Trailer button: ${hasTrailer ? '✅ SHOWS' : '❌ HIDDEN'}`);
      
      if (!hasFull && !hasTrailer) {
        console.log(`   ⚠️  NO BUTTONS WILL SHOW FOR THIS FILM!`);
      }
      console.log('');
    });

    console.log('📊 SUMMARY:');
    const withFullVideo = films.filter(f => Boolean(f.has_full_video ?? f.full_video_url));
    const withTrailer = films.filter(f => Boolean(f.video_url));
    const withYoutube = films.filter(f => Boolean(f.youtube_url));
    const withNoVideo = films.filter(f => !Boolean(f.has_full_video ?? f.full_video_url) && !Boolean(f.video_url));

    console.log(`✅ Films with Watch Now button: ${withFullVideo.length}/${films.length}`);
    console.log(`✅ Films with trailer: ${withTrailer.length}/${films.length}`);
    console.log(`✅ Films with YouTube links: ${withYoutube.length}/${films.length}`);
    console.log(`❌ Films with NO video buttons: ${withNoVideo.length}/${films.length}`);
    
    if (withNoVideo.length > 0) {
      console.log('\n⚠️  FILMS WITH NO VIDEO BUTTONS:');
      withNoVideo.forEach(film => {
        console.log(`   - "${film.title}"`);
      });
    }

    console.log('\n🎯 TO FIX WATCH NOW BUTTON:');
    console.log('1. Edit film in admin panel');
    console.log('2. Either set "has_full_video" to true');
    console.log('3. OR add a "full_video_url"'); 
    console.log('4. OR add a "youtube_url" for YouTube videos');
    console.log('5. Button will appear and work immediately');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

debugFilms();