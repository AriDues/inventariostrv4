import React from 'react';
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import Productos from './pages/Productos'; // Importar la nueva página

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    // Agregar el enlace principal del plugin al menú lateral
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');
        return component;
      },
      permissions: [], // Permisos para esta opción
    });

    // Agregar un nuevo enlace al menú
    app.addMenuLink({
      to: `/plugins/${pluginId}/productos`, // Ruta de la nueva página
      icon: PluginIcon, // Icono del menú (puedes usar otro si lo deseas)
      intlLabel: {
        id: `${pluginId}.productos`, // ID para la traducción
        defaultMessage: 'Equipos', // Texto del enlace
      },
      Component: Productos, // Componente de la nueva página
      permissions: [], // Permisos para esta opción
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