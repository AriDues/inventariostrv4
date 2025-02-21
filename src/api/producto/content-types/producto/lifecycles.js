// src/api/producto/content-types/producto/lifecycles.js
module.exports = {
    beforeCreate(event) {
      const { data } = event.params;
  
      // Convertir el campo "nombre" a mayúsculas al crear
      if (data.Nombre) {
        data.Nombre = data.Nombre.toLowerCase();
      }
    },
  
    beforeUpdate(event) {
      const { data } = event.params;
  
      // Convertir el campo "nombre" a mayúsculas al actualizar
      if (data.Nombre) {
        data.Nombre = data.Nombre.toLowerCase();
      }
    },
  };