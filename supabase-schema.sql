-- ============================================================
--  Proclama — Schema de Supabase
--  Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS proclamas (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  texto            TEXT        NOT NULL CHECK (char_length(texto) <= 280),
  autor            TEXT        NOT NULL CHECK (char_length(autor) <= 80),
  monto            INTEGER     NOT NULL CHECK (monto >= 100),   -- en centavos USD
  categoria        TEXT        NOT NULL DEFAULT 'General',
  publicada        BOOLEAN     NOT NULL DEFAULT FALSE,
  stripe_session_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_proclamas_publicada  ON proclamas (publicada);
CREATE INDEX IF NOT EXISTS idx_proclamas_monto      ON proclamas (monto DESC);
CREATE INDEX IF NOT EXISTS idx_proclamas_session    ON proclamas (stripe_session_id);

-- ============================================================
--  Row Level Security
-- ============================================================

ALTER TABLE proclamas ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo proclamas publicadas (para la clave anónima)
CREATE POLICY "Leer proclamas publicadas"
  ON proclamas
  FOR SELECT
  TO anon
  USING (publicada = TRUE);

-- La clave de servicio (SUPABASE_SERVICE_ROLE_KEY) omite RLS automáticamente,
-- por lo que los API routes (checkout y webhook) pueden leer/escribir sin restricciones.
