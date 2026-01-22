/**
 * Hook personnalisé pour la gestion des catégories
 */

import { useState, useEffect } from 'react';
import { categoriesService, type Category } from '../lib/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoriesService.getCategories();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadCategories();
  };

  return {
    categories,
    isLoading,
    error,
    refresh,
  };
}

export function useCategory(id: number) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoriesService.getCategory(id);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCategory(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la catégorie');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadCategory();
  };

  return {
    category,
    isLoading,
    error,
    refresh,
  };
}
