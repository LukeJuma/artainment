# Free Tier Optimization Guide

## Supabase Free Tier Limits
- **Database**: 500MB storage
- **Storage**: 1GB file storage  
- **Bandwidth**: 5GB/month
- **API Requests**: 50,000/month
- **Database Connections**: 2 concurrent

## Vercel Free Tier Limits
- **Bandwidth**: 100GB/month
- **Builds**: 32 concurrent
- **Serverless Function Execution**: 100GB-hrs/month
- **Domains**: Unlimited `.vercel.app` subdomains

## Optimization Strategies

### Database Optimization (Supabase)

#### 1. Efficient Schema Design
```sql
-- Use appropriate data types
CREATE TABLE films (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,        -- Not TEXT for titles
    description TEXT,                    -- TEXT only for long content
    duration INTEGER,                    -- Store minutes as integer
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for frequently queried fields
CREATE INDEX idx_films_title ON films(title);
CREATE INDEX idx_films_created_at ON films(created_at);
```

#### 2. Query Optimization
```php
// Laravel Eloquent - Efficient queries
// BAD: N+1 problem
$films = Film::all();
foreach ($films as $film) {
    echo $film->reviews->count(); // Separate query for each film
}

// GOOD: Eager loading
$films = Film::withCount('reviews')->get();
foreach ($films as $film) {
    echo $film->reviews_count; // Single query
}

// Use pagination to limit results
$films = Film::paginate(20); // Instead of Film::all()

// Select only needed columns
$films = Film::select('id', 'title', 'thumbnail')->get();
```

#### 3. Data Management
```php
// Regular cleanup of old data
// In a scheduled command or manual script
DB::table('notifications')
  ->where('created_at', '<', now()->subDays(30))
  ->delete();

// Soft delete instead of hard delete for important records
class Film extends Model 
{
    use SoftDeletes;
}
```

### Storage Optimization (Supabase)

#### 1. Image Compression
```php
// Before uploading, compress images
use Intervention\Image\Facades\Image;

public function uploadImage($file) 
{
    $image = Image::make($file);
    
    // Resize if too large
    if ($image->width() > 1920) {
        $image->resize(1920, null, function ($constraint) {
            $constraint->aspectRatio();
        });
    }
    
    // Compress quality
    $compressed = $image->encode('webp', 80);
    
    return Storage::disk('s3')->put('images/' . $filename, $compressed);
}
```

#### 2. File Management
```php
// Delete old files when updating
public function updateFilmPoster($film, $newFile)
{
    // Delete old poster
    if ($film->poster_path) {
        Storage::disk('s3')->delete($film->poster_path);
    }
    
    // Upload new poster
    $path = $this->uploadImage($newFile);
    $film->update(['poster_path' => $path]);
}

// Cleanup unused files regularly
public function cleanupUnusedFiles()
{
    $usedFiles = collect([
        Film::pluck('poster_path'),
        Film::pluck('trailer_path'),
        // ... other file references
    ])->flatten()->filter();
    
    $allFiles = Storage::disk('s3')->files('images');
    $unusedFiles = collect($allFiles)->diff($usedFiles);
    
    Storage::disk('s3')->delete($unusedFiles->toArray());
}
```

### API Optimization

#### 1. Response Caching
```php
// Cache frequently requested data
public function getPopularFilms()
{
    return Cache::remember('popular_films', 3600, function () {
        return Film::withCount('views')
                   ->orderBy('views_count', 'desc')
                   ->limit(10)
                   ->get();
    });
}

// Cache API responses
Route::get('/api/films', function () {
    return Cache::remember('api_films_' . request()->query(), 1800, function () {
        return Film::with(['genre', 'director'])
                   ->paginate(20);
    });
});
```

#### 2. Efficient Pagination
```php
// Use cursor pagination for large datasets
public function index(Request $request)
{
    $films = Film::when($request->cursor, function ($query, $cursor) {
            return $query->where('id', '>', $cursor);
        })
        ->orderBy('id')
        ->limit(20)
        ->get();
        
    return response()->json([
        'data' => $films,
        'next_cursor' => $films->last()?->id
    ]);
}
```

#### 3. Rate Limiting
```php
// In RouteServiceProvider
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Apply to routes
Route::middleware(['throttle:api'])->group(function () {
    // API routes
});
```

### Frontend Optimization (Vercel)

#### 1. Code Splitting
```javascript
// Lazy load components
const FilmDetail = lazy(() => import('./components/FilmDetail'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// Use in routes
<Route 
  path="/film/:id" 
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <FilmDetail />
    </Suspense>
  } 
/>
```

#### 2. Asset Optimization
```javascript
// Optimize images
import { useState } from 'react';

const OptimizedImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <>
      {!loaded && <div className="bg-gray-200 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  );
};
```

#### 3. API Request Optimization
```javascript
// Implement request caching
const useCache = () => {
  const cache = useRef(new Map());
  
  const get = async (url) => {
    if (cache.current.has(url)) {
      return cache.current.get(url);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    cache.current.set(url, data);
    return data;
  };
  
  return { get };
};

// Debounce search requests
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

## Monitoring & Alerts

### 1. Usage Monitoring Scripts
```php
// Create Artisan command to check database size
php artisan make:command CheckDatabaseSize

// In the command
public function handle()
{
    $size = DB::select("SELECT pg_size_pretty(pg_database_size('postgres')) as size")[0]->size;
    
    $this->info("Database size: {$size}");
    
    // Alert if over 400MB (80% of 500MB limit)
    if (strpos($size, 'MB') !== false && intval($size) > 400) {
        $this->warn("Database approaching limit!");
        // Send notification
    }
}
```

### 2. Storage Monitoring
```php
// Check storage usage
public function checkStorageUsage()
{
    $files = Storage::disk('s3')->allFiles();
    $totalSize = 0;
    
    foreach ($files as $file) {
        $totalSize += Storage::disk('s3')->size($file);
    }
    
    $sizeInMB = $totalSize / 1024 / 1024;
    
    if ($sizeInMB > 800) { // 80% of 1GB
        // Alert admin
        Mail::to('admin@example.com')->send(new StorageAlert($sizeInMB));
    }
}
```

## Emergency Procedures

### If Database Limit Exceeded
1. Identify largest tables: `SELECT schemaname,tablename,pg_size_pretty(size) FROM (SELECT schemaname,tablename,pg_total_relation_size(schemaname||'.'||tablename) AS size FROM pg_tables WHERE schemaname='public') AS TABLES ORDER BY size DESC;`
2. Archive old data to external storage
3. Implement data retention policies

### If Storage Limit Exceeded
1. Identify largest files
2. Compress or delete unused media
3. Move to external CDN if necessary

### If API Limit Exceeded
1. Implement more aggressive caching
2. Reduce API calls from frontend
3. Optimize database queries to reduce processing time

This optimization guide ensures you stay well within free tier limits while maintaining good performance!