let isAfterCreateRunning = false; // Variable para controlar la ejecución del hook

module.exports = {
    async afterCreate(event) {
       /*  // Si el hook ya se está ejecutando, salir
        if (isAfterCreateRunning) {
            console.log('afterCreate ya se está ejecutando. Ignorando esta ejecución.');
            return;
        } */

        const cleanObject = (obj) => JSON.parse(JSON.stringify(obj, (key, value) =>  
            value === undefined ? null : value  
        ));

        // Bloquear la ejecución del hook
        isAfterCreateRunning = true;

        try {
            const { result } = event; // El movimiento creado
    
            // Obtener el movimiento con las relaciones pobladas
            const populatedMovement = await strapi.entityService.findMany(
            'api::movimiento-de-inventario.movimiento-de-inventario', // Reemplaza con el nombre correcto de tu tipo de contenido
            {
                filters: { id: result.id }, // Filtra por el ID del movimiento
                populate: {
                    productos: true, 
                    almacenes: true 
                }, // Poblar las relaciones
                limit: 1, // Limitar a un solo resultado
            }
            );
    
            // Imprimir el objeto completo para depuración
            console.log(JSON.stringify(populatedMovement, null, 2) + " cantidad " + populatedMovement.length);
    
            // Verificar si populatedMovement es un array y tiene elementos
            if (!populatedMovement || populatedMovement.length === 0) {
                console.error('No se encontró el movimiento de inventario');
                return;
            }
    
            // Acceder al primer elemento del array
            const movement = cleanObject(populatedMovement[0]);
            console.log(JSON.stringify(movement.productos, null, 2) + " produuuuuuctos " );

    
            // Verificar si las relaciones están pobladas
            if (movement.productos.length === 0 || movement.almacenes.length === 0) {
            console.error('No se pudieron cargar las relaciones del movimiento de inventario');
            return;
            }
    
            // Acceder al nombre del producto (usando la propiedad correcta: "Nombre")
            const nombreProducto = movement.productos[0]?.Nombre;
            if (!nombreProducto) {
            console.error('No se pudo obtener el nombre del producto');
            return;
            }
            console.log('Nombre del producto:', nombreProducto);
    
            // Acceder al nombre del almacén (usando la propiedad correcta: "nombre")
            const nombreAlmacen = movement.almacenes[0]?.nombre;
            if (!nombreAlmacen) {
            console.error('No se pudo obtener el nombre del almacén');
            return;
            }
            console.log('Nombre del almacén:', nombreAlmacen);
    
            const productId = movement.productos[0].id;
            const warehouseId = movement.almacenes[0].id;
            const movementType = movement.tipo; // "Entrada" o "Salida"
            const quantity = movement.cantidad;
    
            if (!productId || !warehouseId || !movementType || !quantity) {
            console.error('Datos incompletos en el movimiento de inventario');
            return;
            }
    
            // Buscar el registro de stock en stock_by_warehouse
            const stockEntry = await strapi.entityService.findMany('api::stock-almacen.stock-almacen', {
            filters: {
                productos: productId,
                almacenes: warehouseId,
            },
            limit: 1,
            });
    
            if (stockEntry.length === 0) {
                console.error('No se encontró el registro de stock para el producto y almacén especificados');
                return;
            }
    
            const currentStock = stockEntry[0].cantidad;
    
            // Calcular el nuevo stock
            let newStock;
                if (movementType === 'Entrada') {
                newStock = currentStock + quantity;
            } else if (movementType === 'Salida') {
                newStock = currentStock - quantity;
            } else {
                console.error('Tipo de movimiento no válido');
                return;
            }
    
            // Validar que el stock no sea negativo
            if (newStock < 0) {
                console.error('No hay suficiente stock para realizar la salida');
                return;
            }
    
            // Actualizar el stock en stock_by_warehouse
            await strapi.entityService.update('api::stock-almacen.stock-almacen', stockEntry[0].id, {
                data: {
                    cantidad: newStock,
                },
            });
    
            console.log(`Stock actualizado para el producto ${nombreProducto} en el almacén ${nombreAlmacen}. Nuevo stock: ${newStock}`);
        } catch (error) {
            console.error('Error en afterCreate:', error);
        } finally {
            // Desbloquear la ejecución del hook
            isAfterCreateRunning = false;
        }
    },
};