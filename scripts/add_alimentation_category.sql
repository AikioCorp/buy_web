-- ============================================
-- SCRIPT: AJOUTER LA CATÉGORIE ALIMENTATION
-- ============================================

-- 1. Ajouter la catégorie parente "Alimentation"
INSERT INTO categories (name, slug, icon, image, parent_id, en_vedette, created_at, updated_at)
VALUES (
  'Alimentation',
  'alimentation',
  'utensils',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop',
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  image = EXCLUDED.image,
  en_vedette = EXCLUDED.en_vedette,
  updated_at = NOW();

-- 2. Ajouter les sous-catégories d'Alimentation
INSERT INTO categories (name, slug, icon, image, parent_id, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'alimentation'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Épicerie', 'epicerie', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=200&fit=crop'),
  ('Boissons', 'boissons', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'),
  ('Produits Frais', 'produits-frais', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop'),
  ('Conserves', 'conserves', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=200&fit=crop'),
  ('Snacks & Confiseries', 'snacks-confiseries', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=200&fit=crop'),
  ('Produits Bio', 'produits-bio', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'),
  ('Céréales & Petit-déjeuner', 'cereales-petit-dejeuner', 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=300&h=200&fit=crop'),
  ('Condiments & Sauces', 'condiments-sauces', 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent_id = EXCLUDED.parent_id,
  updated_at = NOW();

-- 3. Vérification
SELECT 
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.image,
  p.name as parent_name,
  c.en_vedette
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.slug = 'alimentation' OR p.slug = 'alimentation'
ORDER BY c.name;
