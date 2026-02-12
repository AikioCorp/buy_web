-- ============================================
-- SCRIPT 1: VÉRIFICATION DES CATÉGORIES EXISTANTES
-- Exécuter ce script d'abord pour voir vos catégories
-- ============================================

-- Voir toutes les colonnes de la table categories
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- ============================================
-- Voir toutes les catégories parentes (sans parent)
-- ============================================
SELECT 
  id,
  name,
  slug,
  icon,
  image,
  parent_id,
  en_vedette,
  created_at
FROM categories 
WHERE parent_id IS NULL
ORDER BY name;

-- ============================================
-- Voir toutes les catégories avec leur hiérarchie
-- ============================================
SELECT 
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.image,
  p.name as parent_name,
  c.en_vedette,
  (SELECT COUNT(*) FROM categories sub WHERE sub.parent_id = c.id) as nb_sous_categories
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY COALESCE(p.name, c.name), c.name;

-- ============================================
-- Compter les catégories
-- ============================================
SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE parent_id IS NULL) as categories_parentes,
  COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as sous_categories
FROM categories;


-- ============================================
-- SCRIPT 2: MISE À JOUR DES CATÉGORIES (À EXÉCUTER APRÈS VÉRIFICATION)
-- Décommenter et adapter selon vos besoins
-- ============================================

-- Exemple: Ajouter des sous-catégories à une catégorie existante
-- INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
-- SELECT 
--   'Nom Sous-Catégorie',
--   'slug-sous-categorie',
--   'folder',
--   'https://votre-image.jpg',
--   (SELECT id FROM categories WHERE slug = 'slug-parent'),
--   false,
--   NOW(),
--   NOW()
-- ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SOUS-CATÉGORIES - Maison & Jardin
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'maison-jardin'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Meubles', 'meubles', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop'),
  ('Décoration', 'decoration', 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=300&h=200&fit=crop'),
  ('Literie', 'literie', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop'),
  ('Cuisine & Salle à manger', 'cuisine-salle-a-manger', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop'),
  ('Jardin & Extérieur', 'jardin-exterieur', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop'),
  ('Rangement', 'rangement', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Éclairage', 'eclairage', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=200&fit=crop'),
  ('Tapis & Sols', 'tapis-sols', 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Électronique
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'electronique'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Ordinateurs', 'ordinateurs', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop'),
  ('Tablettes', 'tablettes', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop'),
  ('TV & Home Cinéma', 'tv-home-cinema', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop'),
  ('Audio & Hi-Fi', 'audio-hifi', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=200&fit=crop'),
  ('Appareils Photo', 'appareils-photo', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop'),
  ('Accessoires', 'accessoires-electronique', 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=300&h=200&fit=crop'),
  ('Stockage', 'stockage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=200&fit=crop'),
  ('Réseaux', 'reseaux', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Mode
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'mode'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Vêtements Homme', 'vetements-homme', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&h=200&fit=crop'),
  ('Vêtements Femme', 'vetements-femme', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=200&fit=crop'),
  ('Chaussures', 'chaussures', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop'),
  ('Sacs & Bagages', 'sacs-bagages', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=200&fit=crop'),
  ('Montres', 'montres', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=200&fit=crop'),
  ('Lunettes', 'lunettes', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop'),
  ('Bijoux', 'bijoux-mode', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop'),
  ('Accessoires Mode', 'accessoires-mode', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Bijoux & Accessoires
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'bijoux-accessoires'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Colliers', 'colliers', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=200&fit=crop'),
  ('Bracelets', 'bracelets', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=200&fit=crop'),
  ('Bagues', 'bagues', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=200&fit=crop'),
  ('Boucles d''oreilles', 'boucles-oreilles', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=200&fit=crop'),
  ('Montres Luxe', 'montres-luxe', 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=300&h=200&fit=crop'),
  ('Bijoux Fantaisie', 'bijoux-fantaisie', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=200&fit=crop'),
  ('Bijoux Homme', 'bijoux-homme', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=200&fit=crop'),
  ('Accessoires Cheveux', 'accessoires-cheveux', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Sports & Loisirs
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'sports-loisirs'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Fitness', 'fitness', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop'),
  ('Football', 'football', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=200&fit=crop'),
  ('Basketball', 'basketball', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop'),
  ('Natation', 'natation', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop'),
  ('Cyclisme', 'cyclisme', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=200&fit=crop'),
  ('Camping', 'camping', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=200&fit=crop'),
  ('Yoga', 'yoga', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop'),
  ('Équipements Sport', 'equipements-sport', 'https://images.unsplash.com/photo-1461896836934- voices-of-the-past?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Mère & Enfants
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'mere-enfants'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Vêtements Bébé', 'vetements-bebe', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=200&fit=crop'),
  ('Jouets', 'jouets', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=200&fit=crop'),
  ('Poussettes', 'poussettes', 'https://images.unsplash.com/photo-1586048018531-0e3e1e7a4e0a?w=300&h=200&fit=crop'),
  ('Alimentation Bébé', 'alimentation-bebe', 'https://images.unsplash.com/photo-1584839404042-8bc21d240de9?w=300&h=200&fit=crop'),
  ('Couches', 'couches', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop'),
  ('Puériculture', 'puericulture', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=200&fit=crop'),
  ('Vêtements Enfants', 'vetements-enfants', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=200&fit=crop'),
  ('Jeux Éducatifs', 'jeux-educatifs', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Beauté & Santé
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'beaute-sante'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Maquillage', 'maquillage', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop'),
  ('Soins Visage', 'soins-visage', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop'),
  ('Soins Corps', 'soins-corps', 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=200&fit=crop'),
  ('Parfums', 'parfums', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=200&fit=crop'),
  ('Cheveux', 'cheveux', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop'),
  ('Santé', 'sante', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop'),
  ('Bien-être', 'bien-etre', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop'),
  ('Hygiène', 'hygiene', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Téléphones & Accessoires
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'telephones'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Smartphones', 'smartphones', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'),
  ('Coques & Protections', 'coques-protections', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&h=200&fit=crop'),
  ('Chargeurs', 'chargeurs', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&h=200&fit=crop'),
  ('Écouteurs', 'ecouteurs', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'),
  ('Montres Connectées', 'montres-connectees', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=200&fit=crop'),
  ('Batteries', 'batteries', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=200&fit=crop'),
  ('Câbles', 'cables', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Supports', 'supports', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Automobiles & Motos
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'automobiles-motos'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Pièces Auto', 'pieces-auto', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop'),
  ('Accessoires Auto', 'accessoires-auto', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop'),
  ('Pneus', 'pneus', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Huiles & Fluides', 'huiles-fluides', 'https://images.unsplash.com/photo-1635784063388-1ff609e4e0c5?w=300&h=200&fit=crop'),
  ('Pièces Moto', 'pieces-moto', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Casques', 'casques', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('GPS', 'gps', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Entretien', 'entretien-auto', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- SOUS-CATÉGORIES - Outils & Bricolage
-- ============================================
INSERT INTO categories (name, slug, icon, image, parent, en_vedette, created_at, updated_at)
SELECT 
  sub.name,
  sub.slug,
  'folder',
  sub.image,
  (SELECT id FROM categories WHERE slug = 'outils-bricolage'),
  false,
  NOW(),
  NOW()
FROM (VALUES
  ('Outillage Électrique', 'outillage-electrique', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop'),
  ('Outillage à Main', 'outillage-main', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop'),
  ('Peinture', 'peinture', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=200&fit=crop'),
  ('Plomberie', 'plomberie', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Électricité', 'electricite', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Quincaillerie', 'quincaillerie', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Sécurité', 'securite', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'),
  ('Mesure', 'mesure', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop')
) AS sub(name, slug, image)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  parent = EXCLUDED.parent,
  updated_at = NOW();

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Afficher toutes les catégories avec leur hiérarchie
SELECT 
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.image,
  p.name as parent_name,
  c.en_vedette
FROM categories c
LEFT JOIN categories p ON c.parent = p.id
ORDER BY COALESCE(p.name, c.name), c.name;
