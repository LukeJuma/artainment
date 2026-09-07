// Test Watch Now button functionality
console.log('🎬 TESTING WATCH NOW BUTTON FUNCTIONALITY\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function testWatchNow() {
  try {
    console.log('📡 Testing "Daya" film (should have Watch Now button)...');
    
    // Get the film details
    const response = await fetch(`${API_BASE}/films/the-red-soil`);
    const film = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', film.message);
      return;
    }

    console.log(`🎬 Film: "${film.title}"`);
    console.log(`🔗 Slug: ${film.slug}`);
    
    // Check button logic (same as in FilmDetailHero.tsx)
    const hasTrailer = Boolean(film.video_url);
    const hasFull = Boolean(film.has_full_video ?? film.full_video_url);
    
    console.log('\n🎯 BUTTON VISIBILITY:');
    console.log(`   Watch Now button: ${hasFull ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`   Watch Trailer button: ${hasTrailer ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    
    // Check video modal logic (same as in FilmDetailPage.tsx)
    console.log('\n🎥 VIDEO MODAL LOGIC:');
    console.log(`   Trailer modal condition: ${hasTrailer && film.video_url ? '✅ CAN SHOW' : '❌ BLOCKED'}`);
    console.log(`   Full video modal condition: ${hasFull && film.has_full_video ? '✅ CAN SHOW' : '❌ BLOCKED'}`);
    
    // Check what video source would be used
    console.log('\n📺 VIDEO SOURCE:');
    if (film.youtube_url) {
      console.log(`   📺 YouTube URL: ${film.youtube_url}`);
      console.log(`   🎯 Video modal will show: YouTube Player`);
    } else if (film.full_video_url) {
      const streamUrl = `${API_BASE}/stream/${encodeURIComponent(film.slug)}`;
      console.log(`   🎬 Stream URL: ${streamUrl}`);
      console.log(`   🎯 Video modal will show: Native video player`);
    }
    
    console.log('\n🔍 DETAILED ANALYSIS:');
    console.log(`   film.video_url: ${film.video_url || 'null'}`);
    console.log(`   film.full_video_url: ${film.full_video_url || 'null'}`);
    console.log(`   film.has_full_video: ${film.has_full_video || 'null'}`);
    console.log(`   film.youtube_url: ${film.youtube_url || 'null'}`);
    
    // Check the modal rendering condition from FilmDetailPage.tsx line 75
    const modalWillRender = hasFull && film.has_full_video;
    console.log('\n🎭 MODAL RENDERING:');
    console.log(`   Modal will render: ${modalWillRender ? '✅ YES' : '❌ NO'}`);
    
    if (!modalWillRender) {
      console.log(`   🔧 ISSUE: Modal requires BOTH conditions:`);
      console.log(`      1. hasFull = Boolean(film.has_full_video ?? film.full_video_url) = ${hasFull}`);
      console.log(`      2. film.has_full_video = ${Boolean(film.has_full_video)}`);
      console.log(`   💡 FIX: Set has_full_video to true in database`);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testWatchNow();