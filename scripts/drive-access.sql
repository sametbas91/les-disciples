-- Ajouter la colonne drive_access au profil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drive_access boolean DEFAULT false;
