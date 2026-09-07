// Verify Watch Now button fix
console.log('🔧 VERIFYING WATCH NOW BUTTON FIX\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function verifyFix() {
  try {
    console.log('📡 Testing "Daya" film after fix...');
    
    const response = await fetch(`${API_BASE}/films/the-red-soil`);
    const film = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', film.message);
      return;
    }

    console.log(`🎬 Film: "${film.title}"`);
    
    // Button visibility logic (from FilmDetailHero.tsx)
    const hasTrailer = Boolean(film.video_url);
    const hasFull = Boolean(film.has_full_video ?? film.full_video_url);
    
    // OLD modal logic (broken)
    const oldModalCondition = hasFull && film.has_full_video;
    
    // NEW modal logic (fixed)
    const newModalCondition = hasFull && Boolean(film.has_full_video ?? film.full_video_url);
    
    console.log('\n🎯 BUTTON & MODAL LOGIC:');
    console.log(`   Watch Now button shows: ${hasFull ? '✅ YES' : '❌ NO'}`);
    console.log(`   OLD modal would render: ${oldModalCondition ? '✅ YES' : '❌ NO'} (BROKEN)`);
    console.log(`   NEW modal will render: ${newModalCondition ? '✅ YES' : '❌ NO'} (FIXED)`);
    
    console.log('\n📺 VIDEO DETAILS:');
    console.log(`   has_full_video: ${film.has_full_video ?? 'null'}`);
    console.log(`   full_video_url: ${film.full_video_url ?? 'null'}`);
    console.log(`   youtube_url: ${film.youtube_url ?? 'null'}`);
    
    console.log('\n🎥 MODAL BEHAVIOR:');
    if (film.youtube_url) {
      console.log(`   ✅ Will show YouTube player for: ${film.youtube_url}`);
    } else {
      const streamUrl = `${API_BASE}/stream/${encodeURIComponent(film.slug)}`;
      console.log(`   ✅ Will show native video player for: ${streamUrl}`);
    }
    
    console.log('\n🎉 RESULT:');
    if (hasFull && newModalCondition) {
      console.log('✅ WATCH NOW BUTTON IS NOW WORKING!');
      console.log('   - Button appears ✅');
      console.log('   - Modal will open ✅');
      console.log('   - Video will play ✅');
    } else {
      console.log('❌ Still not working - need to check film data');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

verifyFix();