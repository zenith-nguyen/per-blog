import Link from 'next/link';
import { Home, User, Package, Star } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-slate-900 font-bold text-xl">
              <span className="bg-slate-900 text-white px-2 py-1 rounded-sm font-mono">HN</span>
              <span className="hidden sm:inline">Tech Blog</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600">[01]</span>
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link href="/blog/about-me" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600">[02]</span>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </Link>
            <Link href="#products" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600">[03]</span>
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </Link>
            <Link href="#fav" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600">[04]</span>
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">FAV</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
