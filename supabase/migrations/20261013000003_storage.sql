-- ============================================================================
-- ReVento: Storage Bucket for Resource Listings
-- ============================================================================

-- Create 'resource-images' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resource-images',
    'resource-images',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage RLS Policies
CREATE POLICY "Resource images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resource-images');

CREATE POLICY "Authenticated users can upload resource images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resource-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Owners can update or delete their resource images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resource-images'
        AND auth.uid() = owner
    );
