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

-- ============================================================
--  MIGRACIÓN: Animales en perfiles + Feed aleatorio
--  Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Columna animal en perfiles
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS animal TEXT DEFAULT '🐶';

-- Función RPC para feed aleatorio con join a perfiles
CREATE OR REPLACE FUNCTION get_proclamas_random(
  p_limit  INT DEFAULT 10,
  p_offset INT DEFAULT 0,
  p_search TEXT DEFAULT ''
)
RETURNS TABLE (
  id           UUID,
  texto        TEXT,
  autor        TEXT,
  monto        INT,
  categoria    TEXT,
  reacciones   JSONB,
  created_at   TIMESTAMPTZ,
  apoyos       INT,
  monto_total  INT,
  user_id      UUID,
  autor_animal TEXT,
  total_count  BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.texto,
    p.autor,
    p.monto,
    p.categoria,
    p.reacciones,
    p.created_at,
    p.apoyos,
    p.monto_total,
    p.user_id,
    pf.animal AS autor_animal,
    COUNT(*) OVER()::BIGINT AS total_count
  FROM proclamas p
  LEFT JOIN perfiles pf ON pf.id = p.user_id
  WHERE p.publicada = TRUE
    AND (
      p_search = ''
      OR p.texto ILIKE '%' || p_search || '%'
      OR p.autor ILIKE '%' || p_search || '%'
    )
  ORDER BY RANDOM()
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- Acceso anónimo a la función
GRANT EXECUTE ON FUNCTION get_proclamas_random TO anon;
