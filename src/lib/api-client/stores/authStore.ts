import { create } from 'zustand'
import { getSupabase } from '../client'
import { User } from '../types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ShopData {
  name: string
  description: string
  address: string
  phone: string
  email: string
  logo?: string
}

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: string, shopData?: ShopData) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      set({ user: session.user, profile, loading: false })

      // Essayer de créer une boutique en attente après connexion
      try {
        const pending = localStorage.getItem('pendingShop')
        if (pending && profile?.role === 'vendor') {
          const shopData: ShopData = JSON.parse(pending)
          const slug = shopData.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Math.random().toString(36).substring(2, 7)

          const { error: shopError } = await supabase.rpc('create_vendor_shop', {
            p_name: shopData.name,
            p_slug: slug,
            p_description: shopData.description,
            p_address: shopData.address,
            p_phone: shopData.phone,
            p_email: shopData.email,
            p_logo_url: shopData.logo || null,
          })
          if (!shopError) {
            localStorage.removeItem('pendingShop')
          } else {
            console.error('Erreur création boutique (post-login):', shopError)
          }
        }
      } catch {}
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile })

        // Essayer de créer une boutique en attente après changement d'état auth
        try {
          const pending = localStorage.getItem('pendingShop')
          if (pending && profile?.role === 'vendor') {
            const shopData: ShopData = JSON.parse(pending)
            const slug = shopData.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              + '-' + Math.random().toString(36).substring(2, 7)

            const { error: shopError } = await supabase.rpc('create_vendor_shop', {
              p_name: shopData.name,
              p_slug: slug,
              p_description: shopData.description,
              p_address: shopData.address,
              p_phone: shopData.phone,
              p_email: shopData.email,
              p_logo_url: shopData.logo || null,
            })
            if (!shopError) {
              localStorage.removeItem('pendingShop')
            } else {
              console.error('Erreur création boutique (onAuthStateChange):', shopError)
            }
          }
        } catch {}
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  signIn: async (email: string, password: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({ user: data.user, profile })

      // Essayer de créer une boutique en attente après connexion
      try {
        const pending = localStorage.getItem('pendingShop')
        if (pending && profile?.role === 'vendor') {
          const shopData: ShopData = JSON.parse(pending)
          const slug = shopData.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Math.random().toString(36).substring(2, 7)

          const { error: shopError } = await supabase.rpc('create_vendor_shop', {
            p_name: shopData.name,
            p_slug: slug,
            p_description: shopData.description,
            p_address: shopData.address,
            p_phone: shopData.phone,
            p_email: shopData.email,
            p_logo_url: shopData.logo || null,
          })
          if (!shopError) {
            localStorage.removeItem('pendingShop')
          } else {
            console.error('Erreur création boutique (signIn):', shopError)
          }
        }
      } catch {}
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: string, shopData?: ShopData) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      console.log('🔐 Utilisateur créé dans Auth:', data.user.id)
      
      // Attendre que le profil soit créé par le trigger (avec retry)
      let profile = null
      let retries = 0
      const maxRetries = 10 // Augmenté à 10 tentatives
      
      while (!profile && retries < maxRetries) {
        console.log(`🔄 Tentative ${retries + 1}/${maxRetries} de récupération du profil...`)
        
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.log('⚠️ Erreur récupération profil:', profileError)
        }
        
        if (profileData) {
          console.log('✅ Profil trouvé:', profileData)
          profile = profileData
        } else {
          console.log('⏳ Profil pas encore créé, attente 1s...')
          // Augmenter le délai à 1 seconde
          await new Promise(resolve => setTimeout(resolve, 1000))
          retries++
        }
      }

      if (!profile) {
        console.error('❌ Impossible de récupérer le profil après', maxRetries, 'tentatives')
        throw new Error('Erreur lors de la création du profil utilisateur')
      }

      console.log('📝 Profil final récupéré:', profile)
      set({ user: data.user, profile })

      // Si vendeur et données boutique fournies, créer la boutique
      if (role === 'vendor' && shopData) {
        console.log('🔍 Début création boutique')
        console.log('👤 User ID:', data.user.id)
        console.log('👤 Profile:', profile)
        console.log('👤 Profile role:', profile.role)

        // S'assurer qu'une session Auth existe (après signUp, il peut ne pas y en avoir si confirmation email requise)
        const { data: sessionRes } = await supabase.auth.getSession()
        if (!sessionRes.session) {
          console.log('⚠️ Aucune session après signUp, tentative de connexion automatique...')
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) {
            console.warn('❌ Connexion automatique échouée:', signInError)
            // Stocker la boutique pour création après connexion
            try {
              if (shopData) localStorage.setItem('pendingShop', JSON.stringify(shopData))
            } catch {}
            throw new Error('Compte créé. Veuillez confirmer votre email et vous connecter pour finaliser la création de la boutique.')
          }
          console.log('✅ Session créée après connexion:', signInData.session?.user.id)
        }

        // Vérifier que le rôle est bien 'vendor' dans la base
        if (profile.role !== 'vendor') {
          console.error('❌ Le rôle du profil n\'est pas vendor:', profile.role)
          throw new Error('Le profil utilisateur n\'a pas le rôle vendeur')
        }
        
        console.log('✅ Rôle vendeur confirmé')
        
        // Générer un slug à partir du nom de la boutique
        const slug = shopData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
          .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
          .replace(/^-+|-+$/g, '') // Retirer les tirets au début et à la fin
          + '-' + Math.random().toString(36).substring(2, 7) // Ajouter un ID unique

        const shopParams = {
          p_name: shopData.name,
          p_slug: slug,
          p_description: shopData.description,
          p_address: shopData.address,
          p_phone: shopData.phone,
          p_email: shopData.email,
          p_logo_url: shopData.logo || null
        }
        
        console.log('📦 Paramètres boutique:', shopParams)

        const { error: shopError, data: shopResult } = await supabase
          .rpc('create_vendor_shop', shopParams)

        if (shopError) {
          console.error('❌ Erreur lors de la création de la boutique:', shopError)
          console.error('Code:', shopError.code)
          console.error('Message:', shopError.message)
          console.error('Details:', shopError.details)
          console.error('Hint:', shopError.hint)
          // Si non authentifié côté RPC, stocker pour création après connexion
          if (shopError.code === 'P0001' || /non authentifié/i.test(shopError.message)) {
            try {
              if (shopData) localStorage.setItem('pendingShop', JSON.stringify(shopData))
            } catch {}
            throw new Error('Compte créé. Veuillez vous connecter pour finaliser la création de la boutique.')
          }
          throw new Error(`Compte créé mais erreur lors de la création de la boutique: ${shopError.message}`)
        }
        
        console.log('✅ Boutique créée avec succès:', shopResult)
      }
    }
  },

  signOut: async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
