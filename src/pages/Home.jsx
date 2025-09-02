import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";

export default function Home() {
  const { isAuthenticated, isCoach, user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f9fbfd] dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Header />

      {/* Login-Bereich ganz oben */}
      {!isAuthenticated ? (
        <div className="text-center mt-4 space-y-3 mb-6 flex-grow">
          <div>
            <Link
              to="/player-login"
              className="inline-block text-sm bg-blue-600 dark:bg-blue-700 text-white py-3 px-8 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors mr-3 font-semibold"
            >
              {t('header.playerArea')}
            </Link>
            <Link
              to="/coach-login"
              className="inline-block text-sm bg-[#0a2240] dark:bg-gray-800 text-white py-3 px-8 rounded-lg hover:bg-blue-900 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              {t('header.coachArea')}
            </Link>
          </div>
          <div className="mt-3">
            <Link
              to="/registration-status"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('home.checkRegistrationStatus')}
            </Link>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('home.firstTimeAccess')}
          </p>
        </div>
      ) : (
        <div className="text-center mt-4 mb-6 flex-grow">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('home.loggedInAs')} <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</span>
            {isCoach && <span className="ml-2 text-xs bg-[#0a2240] dark:bg-gray-700 text-white px-2 py-1 rounded">Coach</span>}
          </div>
          {isCoach && (
            <div className="mt-3">
              <Link
                to="/coach/dashboard"
                className="inline-block text-sm bg-[#0a2240] dark:bg-gray-800 text-white py-2 px-6 rounded-lg hover:bg-blue-900 dark:hover:bg-gray-700 transition-colors"
              >
                {t('home.coachDashboard')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Menü-Karten */}
      <main className="flex-1 flex flex-col items-center justify-center pb-4">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
            <MenuItem
              title={t('menu.reflexion')}
              subtitle={t('menu.reflexionSubtitle')}
              link="/reflexion"
            />
            <MenuItem
              title={t('menu.survey')}
              subtitle={t('menu.surveySubtitle')}
              link="/umfrage"
              border
            />
            <MenuItem
              title={t('menu.surveyResults')}
              subtitle={t('menu.surveyResultsSubtitle')}
              link="/umfrage-results"
              border
            />
            <MenuItem title={t('menu.sportFood')} link="/sportfood" border />
            <MenuItem 
              title={t('menu.sponserOrder')} 
              subtitle={t('menu.sponserOrderSubtitle')} 
              externalLink="https://sponser-app.vercel.app" 
              border 
            />
            <MenuItem title={t('menu.cardio')} link="/cardio" border />
            {/* Teamkalender entfernt, da Spieler bereits über MIH benachrichtigt werden */}
            <MenuItem
              title={t('menu.news')}
              subtitle={t('menu.newsSubtitle')}
              link="/news"
              border
            />
          </div>
        </div>
      </main>

      
    </div>
  );
}

function MenuItem({ title, subtitle, link, externalLink, border }) {
  const commonClasses = `block px-6 py-5 ${border ? "border-t border-gray-200 dark:border-gray-700" : ""} hover:bg-[#f3f7fa] dark:hover:bg-gray-700 transition-colors duration-300`;
  const content = (
    <>
      <div className="text-lg font-bold text-[#0a2240] dark:text-white flex items-center">
        {title}
        {externalLink && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </div>
      {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>}
    </>
  );

  if (externalLink) {
    return (
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={link}
      className={commonClasses}
    >
      {content}
    </Link>
  );
}