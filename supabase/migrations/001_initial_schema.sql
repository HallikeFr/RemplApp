-- ============================================================
-- RemplApp — Migration initiale V1
-- ============================================================

-- Extension UUID (déjà activée sur Supabase par défaut)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table : profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  situation_familiale TEXT NOT NULL DEFAULT 'celibataire'
    CONSTRAINT profiles_situation_check CHECK (
      situation_familiale IN ('celibataire', 'pacse', 'marie', 'divorce', 'veuf')
    ),
  enfants_garde_complete INTEGER NOT NULL DEFAULT 0 CHECK (enfants_garde_complete >= 0),
  enfants_garde_alternee INTEGER NOT NULL DEFAULT 0 CHECK (enfants_garde_alternee >= 0),
  autres_personnes_charge INTEGER NOT NULL DEFAULT 0 CHECK (autres_personnes_charge >= 0),
  parent_isole BOOLEAN NOT NULL DEFAULT FALSE,
  nb_parts_fiscales NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (nb_parts_fiscales > 0),
  salaire_hospitalier_annuel NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (salaire_hospitalier_annuel >= 0),
  revenus_conjoint_annuel NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (revenus_conjoint_annuel >= 0),
  carmf_rid_classe TEXT NOT NULL DEFAULT 'A_25'
    CONSTRAINT profiles_carmf_check CHECK (
      carmf_rid_classe IN ('A_25', 'A_pleine')
    ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table : structures
-- ============================================================
CREATE TABLE IF NOT EXISTS structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL CHECK (length(nom) > 0),
  type TEXT NOT NULL DEFAULT 'cabinet_liberal'
    CONSTRAINT structures_type_check CHECK (
      type IN ('cabinet_liberal', 'clinique', 'centre_imagerie', 'hopital_prive')
    ),
  adresse TEXT,
  interlocuteur TEXT,
  telephone TEXT,
  email TEXT,
  tarifs JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table : vacations
-- ============================================================
CREATE TABLE IF NOT EXISTS vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type_vacation TEXT NOT NULL
    CONSTRAINT vacations_type_check CHECK (
      type_vacation IN ('scanner', 'irm', 'radio', 'mammo', 'echo', 'autre')
    ),
  duree TEXT NOT NULL
    CONSTRAINT vacations_duree_check CHECK (
      duree IN ('heure', 'demi_journee', 'journee')
    ),
  tarif_applique NUMERIC(10,2) NOT NULL CHECK (tarif_applique >= 0),
  statut TEXT NOT NULL DEFAULT 'programmee'
    CONSTRAINT vacations_statut_check CHECK (
      statut IN ('programmee', 'realisee', 'payee')
    ),
  google_event_id TEXT,
  notes TEXT,
  synced BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Index pour performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_structures_user_id ON structures(user_id);
CREATE INDEX IF NOT EXISTS idx_vacations_user_id ON vacations(user_id);
CREATE INDEX IF NOT EXISTS idx_vacations_structure_id ON vacations(structure_id);
CREATE INDEX IF NOT EXISTS idx_vacations_date ON vacations(date);
CREATE INDEX IF NOT EXISTS idx_vacations_statut ON vacations(statut);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Structures
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "structures_select_own" ON structures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "structures_insert_own" ON structures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "structures_update_own" ON structures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "structures_delete_own" ON structures
  FOR DELETE USING (auth.uid() = user_id);

-- Vacations
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vacations_select_own" ON vacations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vacations_insert_own" ON vacations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vacations_update_own" ON vacations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vacations_delete_own" ON vacations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER structures_updated_at
  BEFORE UPDATE ON structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vacations_updated_at
  BEFORE UPDATE ON vacations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Trigger : création profil auto à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
