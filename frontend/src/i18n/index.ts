import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptCommon from './locales/pt/common.json';
import ptAuth from './locales/pt/auth.json';
import ptHome from './locales/pt/home.json';
import ptNav from './locales/pt/nav.json';
import ptDashboard from './locales/pt/dashboard.json';
import ptAppointments from './locales/pt/appointments.json';
import ptPublic from './locales/pt/public.json';
import ptAdmin from './locales/pt/admin.json';
import ptBilling from './locales/pt/billing.json';
import ptSettings from './locales/pt/settings.json';
import ptAvailability from './locales/pt/availability.json';
import ptProfile from './locales/pt/profile.json';
import ptClients from './locales/pt/clients.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enHome from './locales/en/home.json';
import enNav from './locales/en/nav.json';
import enDashboard from './locales/en/dashboard.json';
import enAppointments from './locales/en/appointments.json';
import enPublic from './locales/en/public.json';
import enAdmin from './locales/en/admin.json';
import enBilling from './locales/en/billing.json';
import enSettings from './locales/en/settings.json';
import enAvailability from './locales/en/availability.json';
import enProfile from './locales/en/profile.json';
import enClients from './locales/en/clients.json';

const resources = {
  pt: {
    common: ptCommon,
    auth: ptAuth,
    home: ptHome,
    nav: ptNav,
    dashboard: ptDashboard,
    appointments: ptAppointments,
    public: ptPublic,
    admin: ptAdmin,
    billing: ptBilling,
    settings: ptSettings,
    availability: ptAvailability,
    profile: ptProfile,
    clients: ptClients,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    home: enHome,
    nav: enNav,
    dashboard: enDashboard,
    appointments: enAppointments,
    public: enPublic,
    admin: enAdmin,
    billing: enBilling,
    settings: enSettings,
    availability: enAvailability,
    profile: enProfile,
    clients: enClients,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'home',
      'nav',
      'dashboard',
      'appointments',
      'public',
      'admin',
      'billing',
      'settings',
      'availability',
      'profile',
      'clients',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smartsupport_lang',
    },
  });

export default i18n;
