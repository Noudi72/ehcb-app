import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  
  return (
    <nav className="bg-[#002d5b] text-white px-4 py-2 flex items-center justify-between">
      <img src="/assets/ehcb_logo.png" alt="EHC Logo" className="w-10" />
      <button
        className="md:hidden ml-auto"
        onClick={() => setOpen(!open)}
        aria-label="Menü öffnen"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <ul className={`md:flex md:gap-8 md:static absolute top-16 left-0 w-full bg-[#002d5b] transition-all duration-300 ${open ? "block" : "hidden"}`}>
        <li><Link to="/" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.home')}</Link></li>
        <li><Link to="/reflexion" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.reflexion')}</Link></li>
        <li><Link to="/umfragen" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.survey')}</Link></li>
        <li><Link to="/news" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.news')}</Link></li>
        <li><a href="https://sponser-app.vercel.app" target="_blank" rel="noopener" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.sportfood')}</a></li>
        <li><a href="https://noudi72.github.io/Cardio-App-EHCB-U18/" target="_blank" rel="noopener" className="block py-2 px-4 hover:text-[#ffc700]">{t('common.cardio')}</a></li>
      </ul>
    </nav>
  );
}
