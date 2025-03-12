import React from 'react';
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import CalendarIcon from './components/PluginIcon/CalendarIcon';
import CubeIcon from './components/PluginIcon/CubeIcon';
import PluginIcon from './components/PluginIcon';
import Productos from './pages/Productos'; // Importar la nueva página

const name = "Eventos"//pluginPkg.strapi.name;

export default {
  register(app) {
    // Agregar el enlace principal del plugin al menú lateral
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: CalendarIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');
        return component;
      },
      permissions: [], // Permisos para esta opción
      // Función personalizada para determinar si el enlace está activo
      isActive: (match, location) => {
        return location.pathname === `/plugins/${pluginId}`;
      },
    });

    // Agregar un nuevo enlace al menú
    app.addMenuLink({
      to: `/plugins/${pluginId}/productos`, // Ruta de la nueva página
      icon: CubeIcon, // Icono del menú (puedes usar otro si lo deseas)
      intlLabel: {
        id: `${pluginId}.productos`, // ID para la traducción
        defaultMessage: 'Equipos', // Texto del enlace
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');
        return component;
      },
      permissions: [], // Permisos para esta opción
      // Función personalizada para determinar si el enlace está activo
      isActive: (match, location) => {
        return location.pathname.startsWith(`/plugins/${pluginId}/productos`);
      },
    });

    // Registrar el plugin
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) {},

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};