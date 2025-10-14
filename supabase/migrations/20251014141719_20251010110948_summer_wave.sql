/*
  # Corrigir estrutura para comentários e curtidas

  1. Novas Tabelas
    - `product_comments` - Para comentários em produtos
    - `product_likes` - Para curtidas em produtos
    
  2. Modificações
    - Atualizar tabela `messages` para suportar comentários
    - Adicionar índices para performance
    
  3. Segurança
    - Políticas RLS para todas as tabelas
    - Permissões adequadas para usuários autenticados
*/

-- Tabela para curtidas de produtos
CREATE TABLE IF NOT EXISTS product_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Tabela para comentários de produtos
CREATE TABLE IF NOT EXISTS product_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para curtidas
CREATE POLICY "Users can manage own likes"
  ON product_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read likes"
  ON product_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para comentários
CREATE POLICY "Users can create comments"
  ON product_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read comments"
  ON product_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own comments"
  ON product_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_likes_user_product ON product_likes(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_product ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_product ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_created ON product_comments(created_at DESC);

-- Atualizar tabela de mensagens para suportar melhor os comentários
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN parent_id uuid REFERENCES messages(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar índice para mensagens por produto
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id) WHERE product_id IS NOT NULL;