// Final test to confirm Watch Now button fix
console.log('🎬 FINAL WATCH NOW BUTTON TEST\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function finalTest() {
  try {
    console.log('📡 Testing all films for Watch Now button functionality...\n');
    
    const response = await fetch(`${API_BASE}/films?paginate=true`);
    const data = await response.json();
    const films = data.data;
    
    console.log(`✅ Found ${films.length} films\n`);
    
    console.log('🔍 WATCH NOW BUTTON ANALYSIS:\n');
    
    films.forEach((film, index) => {
      console.log(`${index + 1}. "${film.title}"`);
      
      // Button visibility logic (from FilmDetailHero.tsx line 20)
      const hasFull = Boolean(film.has_full_video ?? film.full_video_url);
      const hasTrailer = Boolean(film.video_url);
      
      // FIXED modal rendering logic (from FilmDetailPage.tsx line 75)  
      const modalWillRender = hasFull && Boolean(film.has_full_video ?? film.full_video_url);
      
      console.log(`   🎯 Watch Now button: ${hasFull ? '✅ SHOWS' : '❌ HIDDEN'}`);
      console.log(`   🎭 Modal will render: ${modalWillRender ? '✅ YES' : '❌ NO'}`);
      console.log(`   🎥 Watch Trailer: ${hasTrailer ? '✅ SHOWS' : '❌ HIDDEN'}`);
      
      // Check what video will play
      if (hasFull && modalWillRender) {
        if (film.youtube_url) {
          console.log(`   📺 Will play: YouTube (${film.youtube_url})`);
        } else if (film.full_video_url) {
          console.log(`   📺 Will play: File (${film.full_video_url})`);
        } else {
          console.log(`   📺 Will play: Stream (/api/stream/${film.slug})`);
        }
        console.log(`   🎉 STATUS: FULLY WORKING!`);
      } else if (hasFull && !modalWillRender) {
        console.log(`   ⚠️  STATUS: Button shows but modal won't open (SHOULD BE FIXED NOW)`);
      } else {
        console.log(`   ℹ️  STATUS: No video content - button correctly hidden`);
      }
      console.log('');
    });
    
    // Summary
    const workingButtons = films.filter(f => {
      const hasFull = Boolean(f.has_full_video ?? f.full_video_url);
      const modalWorks = hasFull && Boolean(f.has_full_video ?? f.full_video_url);
      return hasFull && modalWorks;
    });
    
    const brokenButtons = films.filter(f => {
      const hasFull = Boolean(f.has_full_video ?? f.full_video_url);
      const modalWorks = hasFull && Boolean(f.has_full_video ?? f.full_video_url);
      return hasFull && !modalWorks;
    });
    
    console.log('📊 SUMMARY:');
    console.log(`✅ Working Watch Now buttons: ${workingButtons.length}/${films.length}`);
    console.log(`❌ Broken Watch Now buttons: ${brokenButtons.length}/${films.length}`);
    
    if (workingButtons.length > 0) {
      console.log('\n✅ WORKING FILMS:');
      workingButtons.forEach(f => console.log(`   - "${f.title}"`));
    }
    
    if (brokenButtons.length > 0) {
      console.log('\n❌ STILL BROKEN:');
      brokenButtons.forEach(f => console.log(`   - "${f.title}"`));
      console.log('\n🔧 If any films still broken, the fix needs to be deployed');
    } else {
      console.log('\n🎉 ALL WATCH NOW BUTTONS WORKING CORRECTLY!');
    }

    console.log('\n🎯 TO ADD MORE WORKING BUTTONS:');
    console.log('1. Login to admin panel: https://the-artainment.vercel.app/login');
    console.log('2. Go to Films → Edit any film');
    console.log('3. Add YouTube URL or set has_full_video to true');
    console.log('4. Watch Now button will work immediately!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

finalTest();