/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AnErrorOccurred } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import HomePage from '../HomePage';
import Productos from '../Productos'; // Importar la nueva página

const App = () => {
  return (
    <div>
      <Switch>
        {/* Ruta principal */}
        <Route path={`/plugins/${pluginId}`} component={HomePage} exact />

        {/* Nueva ruta */}
        <Route path={`/plugins/${pluginId}/productos`} component={Productos} />

        {/* Ruta de error (si no coincide ninguna ruta) */}
        <Route component={AnErrorOccurred} />
      </Switch>
    </div>
  );
};

export default App;
