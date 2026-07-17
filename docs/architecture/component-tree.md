# Árbol de componentes (referencia rápida)

```
App
├── AuthProvider
│   └── CartProvider
│       └── AppContent
│           └── Router
│               ├── [path=/register] RegisterPage
│               ├── [path=/admin] AdminRoute
│               │   └── AdminPanel (solo si role=admin)
│               ├── [path=/checkout] CheckoutPage
│               └── ShopPage
│                   ├── Header
│                   │   ├── [admin] link Admin
│                   │   ├── CartModal
│                   │   └── LoginModal
│                   ├── HeroSection (solo view=home)
│                   ├── BannerServices (solo view=home)
│                   ├── BrandSection (solo view=home)
│                   └── ProductsSection (solo view=shop)
│                       └── ProductGrid
│                           └── ProductCard[]
└── Footer
```
