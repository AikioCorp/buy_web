-- Script SQL pour supprimer les balises HTML des descriptions de produits
-- À exécuter dans Supabase SQL Editor

-- 1. D'abord, créer une fonction pour nettoyer les balises HTML
CREATE OR REPLACE FUNCTION strip_html_tags(html_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF html_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Supprimer toutes les balises HTML (<tag>, </tag>, <tag/>)
    RETURN regexp_replace(html_text, '<[^>]+>', '', 'gi');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Voir un aperçu des descriptions AVANT modification (optionnel)
-- SELECT id, name, 
--        LEFT(description, 100) as description_avant,
--        LEFT(strip_html_tags(description), 100) as description_apres
-- FROM products
-- WHERE description LIKE '%<%'
-- LIMIT 10;

-- 3. Mettre à jour toutes les descriptions de produits
UPDATE products
SET description = strip_html_tags(description)
WHERE description LIKE '%<%';

-- 4. Vérifier le nombre de lignes modifiées
-- SELECT COUNT(*) as produits_nettoyes 
-- FROM products 
-- WHERE description NOT LIKE '%<%' OR description IS NULL;

-- 5. (Optionnel) Supprimer la fonction après utilisation
-- DROP FUNCTION IF EXISTS strip_html_tags(TEXT);
