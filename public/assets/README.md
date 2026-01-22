# Assets - Images et Logos

Ce dossier contient tous les assets (images, logos, icônes) de l'application BuyMore Mobile.

## 📁 Structure

```
assets/
├── images/
│   ├── logos/          # Logos de l'application et des boutiques
│   ├── products/       # Images des produits
│   ├── categories/     # Images des catégories
│   └── banners/        # Bannières et images promotionnelles
└── icons/              # Icônes personnalisées de l'application
```

## 📝 Organisation des fichiers

### logos/
Placez ici :
- `app_logo.png` - Logo principal de l'application BuyMore
- `app_logo_white.png` - Version blanche du logo (pour fond sombre)
- `splash_logo.png` - Logo pour l'écran de démarrage
- Logos des boutiques partenaires

### products/
Images des produits de la marketplace.
- Format recommandé : PNG ou JPG
- Résolution recommandée : 800x800px minimum
- Nommage : `product_[id].png`

### categories/
Images représentant les différentes catégories de produits.
- Format recommandé : PNG avec transparence
- Résolution recommandée : 512x512px
- Nommage : `category_[nom].png`

### banners/
Bannières promotionnelles et images de fond.
- Format recommandé : JPG
- Résolution recommandée : 1920x1080px ou 16:9
- Nommage : `banner_[nom].jpg`

### icons/
Icônes personnalisées de l'application.
- Format recommandé : PNG avec transparence ou SVG
- Résolution recommandée : 256x256px
- Nommage : `icon_[nom].png`

## 🎨 Utilisation dans le code

Pour utiliser une image dans votre code Flutter :

```dart
// Image depuis assets
Image.asset('assets/images/logos/app_logo.png')

// Avec dimensions
Image.asset(
  'assets/images/products/product_123.png',
  width: 200,
  height: 200,
  fit: BoxFit.cover,
)

// Icône personnalisée
ImageIcon(
  AssetImage('assets/icons/icon_custom.png'),
  size: 24,
  color: Colors.blue,
)
```

## 📐 Formats et résolutions recommandés

### Logos
- **App Icon** : 1024x1024px (PNG avec transparence)
- **Splash Screen** : 1242x2688px (iPhone) / 1440x3040px (Android)

### Images produits
- **Miniature** : 300x300px
- **Standard** : 800x800px
- **Haute résolution** : 1200x1200px

### Bannières
- **Mobile** : 1080x1920px (portrait) ou 1920x1080px (paysage)
- **Ratio** : 16:9 ou 9:16

## 💡 Bonnes pratiques

1. **Optimisation** : Compressez vos images avant de les ajouter
2. **Nommage** : Utilisez des noms descriptifs en snake_case
3. **Format** : 
   - PNG pour les logos et icônes (avec transparence)
   - JPG pour les photos et bannières
   - SVG pour les icônes vectorielles
4. **Taille** : Gardez les fichiers sous 500KB si possible
5. **Organisation** : Respectez la structure des dossiers

## 🔄 Après ajout d'assets

Après avoir ajouté de nouveaux fichiers dans `assets/`, exécutez :

```bash
flutter pub get
```

Puis redémarrez l'application pour voir les changements.

## 📱 Résolutions multiples

Flutter supporte les résolutions multiples. Vous pouvez créer des variantes :

```
assets/images/logos/
├── app_logo.png        # 1x (base)
├── 2.0x/
│   └── app_logo.png    # 2x (haute résolution)
└── 3.0x/
    └── app_logo.png    # 3x (très haute résolution)
```

Flutter choisira automatiquement la bonne résolution selon l'appareil.
