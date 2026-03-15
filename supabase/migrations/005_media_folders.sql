-- Media folders for organizing uploads
CREATE TABLE esys_media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_media_folders_name ON esys_media_folders(name);

-- Add folder reference to media table
ALTER TABLE esys_media
  ADD COLUMN folder_id UUID REFERENCES esys_media_folders(id) ON DELETE SET NULL;

CREATE INDEX idx_esys_media_folder_id ON esys_media(folder_id);
