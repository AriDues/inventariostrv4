const { ApplicationError } = require('@strapi/utils').errors;
let isAfterCreateRunning = false; // Variable para controlar la ejecución del hook
let isBeforeUpdateRunning = false;
const today = new Date();

const formattedDate = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(today);

const cleanObject = (obj) => JSON.parse(JSON.stringify(obj, (key, value) =>  
    value === undefined ? null : value  
));

module.exports = {
    async afterCreate(event) {

         /* // Si el hook ya se está ejecutando, salir
         if (isAfterCreateRunning) {
            console.log('afterCreate ya se está ejecutando. Ignorando esta ejecución.');
            return;
        } */

        // Bloquear la ejecución del hook
        isAfterCreateRunning = true;
    
        try {

            const { result } = event; // El registro creado en productos-en-eventos

            // Obtener el movimiento con las relaciones pobladas
            const populatedProductoEnEvento = await strapi.entityService.findMany(
                'api::productos-en-evento.productos-en-evento', // Reemplaza con el nombre correcto de tu tipo de contenido
                {
                    filters: { id: result.id }, // Filtra por el ID del movimiento
                    populate: {
                        producto: true, 
                        almacen: true,
                        evento: true,
                    }, // Poblar las relaciones
                    limit: 1, // Limitar a un solo resultado
                }
            );

            // Verificar si populatedMovement es un array y tiene elementos
            if (!populatedProductoEnEvento || populatedProductoEnEvento.length === 0) {
                console.error('No se encontró fila aftercreate');
                return;
            }

            const ProductoEnEvento = cleanObject(populatedProductoEnEvento[0]);            
            console.log(" ProductoEnEvento aftercreate ***** " + JSON.stringify(ProductoEnEvento, null, 2));

            // Obtener los datos del registro
            const { estatus, cantidad } = ProductoEnEvento;
            console.log(" result estado aftercreate ***** " + JSON.stringify(estatus, null, 2));

    
            // Verificar si el estado es "Pendiente" o "Devuelto"
            if (estatus === 'Pendiente') {
                console.log("Estado pendiente: se procede a crear un movimiento de inventario")
                // Crear un movimiento de inventario de tipo "Salida"
                const nuevoMovimiento = await strapi.entityService.create('api::movimiento-de-inventario.movimiento-de-inventario', {
                    data: {
                        tipo: 'Salida',
                        cantidad: cantidad,
                        fecha: formattedDate, // Fecha actual
                        razon: `Salida para el evento ${ProductoEnEvento.evento[0].nombre}`,
                        productos: ProductoEnEvento.producto[0].id, // ID del producto
                        almacenes: ProductoEnEvento.almacen[0].id, // ID del almacén,
                        publishedAt: today,
                    },
                });

                console.log(nuevoMovimiento)
            }

        } catch (error) {
            console.error('Error en afterCreate de productos-en-eventos:', error);
        } finally {
            // Desbloquear la ejecución del hook
            isAfterCreateRunning = false;
        }
    },

    async beforeUpdate(event) {
        /* // Si el hook ya se está ejecutando, salir
        if (isBeforeUpdateRunning) {
            console.log('AfterUpdate ya se está ejecutando. Ignorando esta ejecución.');
         return;
         } */
      
         // Bloquear la ejecución del hook
         isBeforeUpdateRunning = true;
      
         try {
            const { params, where } = event;; 
            console.log(" params ***** " + JSON.stringify(params, null, 2));
    
            // Obtener el movimiento con las relaciones pobladas
            const populatedProductoEnEvento = await strapi.entityService.findMany(
                'api::productos-en-evento.productos-en-evento', 
                {
                    filters: { id: params.where.id }, // Filtra por el ID del movimiento
                    populate: {
                        producto: true, 
                        almacen: true,
                        evento: true,
                    }, // Poblar las relaciones
                    limit: 1, // Limitar a un solo resultado
                }
            );
    
            // Verificar si populatedMovement es un array y tiene elementos
            if (!populatedProductoEnEvento || populatedProductoEnEvento.length === 0) {
                console.error('No se encontró fila populatedProductoEnEvento');
                return;
            }
    
            const ProductoEnEvento = cleanObject(populatedProductoEnEvento[0]);

            console.log(" ProductoEnEvento ***** " + JSON.stringify(ProductoEnEvento, null, 2));

    
            // Obtener el evento
            const getEvento = await strapi.entityService.findMany(
                'api::evento.evento', // Reemplaza con el nombre correcto de tu tipo de contenido
                {
                    filters: { id: ProductoEnEvento.evento[0].id }, // Filtra por el ID del evento
                    limit: 1, // Limitar a un solo resultado
                }
            );

        //console.log(" ProductoEnEvento beforeUpdate ***** " + JSON.stringify(getEvento, null, 2));
    
            // Verificar si getEvento es un array y tiene elementos
            if (!getEvento || getEvento.length === 0) {
                console.error('No se encontró fila en getEvento');
                return;
            }
    
            if(getEvento[0].estatus === "Finalizado"){
            throw new ApplicationError('No se puede cambiar el estatus porque el evento está finalizado.', 400);
            }
            
            const {cantidad} = ProductoEnEvento;
            // Obtener los datos del registro actualizado
            const { estatus, cantidad_retornada, cantidad_faltante } = params.data;

            const queryUpdate = async (tipo, razon) =>{
                await strapi.entityService.create('api::movimiento-de-inventario.movimiento-de-inventario', {
                    data: {
                        tipo, //'Entrada',
                        cantidad: cantidad_retornada,
                        fecha: formattedDate, // Fecha actual
                        razon, //`Devolución del producto ${ProductoEnEvento.producto[0].Nombre}`,
                        productos: ProductoEnEvento.producto[0].id, // ID del producto
                        almacenes: ProductoEnEvento.almacen[0].id, // ID del almacén
                        publishedAt: today,
                    },
                });
            }
    
            // Verificar si el campo "estatus" fue modificado
            if (estatus) {
                if (estatus === 'Devuelto') {
                    queryUpdate('Entrada', `Devolución total del producto: ${ProductoEnEvento.producto[0].Nombre}`);
                }
                /* else if(estatus === 'Faltante'){
                    queryUpdate('Entrada', `Devolución parcial del producto: ${ProductoEnEvento.producto[0].Nombre}, se devuelve ${cantidad_retornada} de la cantidad inicial: ${cantidad}, restante: ${cantidad_faltante}`);
                } */
            }
      
         } catch (error) {
             console.error('Error en afterUpdate de productos-en-eventos:', error);
             throw error;
         } finally {
             // Desbloquear la ejecución del hook
             isBeforeUpdateRunning = false;
         }
      },
      
};


