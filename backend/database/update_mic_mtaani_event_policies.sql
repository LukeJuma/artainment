-- Update Mic Mtaani Events RLS Policies for New Status Values
-- This script updates the Row Level Security policies to use the new status values:
-- Old: 'active', 'upcoming', 'approved', 'pending', 'rejected'  
-- New: 'Live', 'Upcoming', 'Sold Out', 'Cancelled'

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "mic_mtaani_events_public_read" ON mic_mtaani_events;
DROP POLICY IF EXISTS "public_read_mm_events" ON mic_mtaani_events;  
DROP POLICY IF EXISTS "public_read_featured_mm_events" ON mic_mtaani_events;
DROP POLICY IF EXISTS "admin_manage_mm_events" ON mic_mtaani_events;

-- Create updated policies with new status values
CREATE POLICY "public_read_featured_mm_events" ON mic_mtaani_events
FOR SELECT TO public
USING (is_featured = true AND status IN ('Live', 'Upcoming'));

CREATE POLICY "admin_manage_mm_events" ON mic_mtaani_events  
FOR ALL TO authenticated
USING (
  -- Allow admins to manage all events
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

-- Note: These policies will be effective once the migration runs to update the status values