import { Outlet } from 'react-router-dom'
import { SimpleNavbar } from './SimpleNavbar'

export function AuthLayout() {
  return (
    <div className="min-h-screen">
      <SimpleNavbar />
      <Outlet />
      
      {/* Navbar mobile en bas pour les pages d'authentification */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f4c2b] z-[100] shadow-md border-t border-[#e8d20c]/20">
        <div className="flex justify-around items-center py-1.5 px-0.5">
          <a href="/" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Accueil</span>
          </a>
          
          <a href="/categories" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Catégories</span>
          </a>
          
          <a href="/shops" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Boutiques</span>
          </a>
          
          <a href="/favorites" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90 relative">
            <div className="p-1 rounded-full relative">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">0</span>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Favoris</span>
          </a>
          
          <a href="/login" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Connexion</span>
          </a>
        </div>
      </div>
    </div>
  )
}
