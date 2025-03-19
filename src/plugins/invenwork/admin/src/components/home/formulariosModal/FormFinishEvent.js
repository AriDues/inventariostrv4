import React, { useState, useEffect, useContext } from "react";
import { TextInput } from '@strapi/design-system';
import { toast } from 'react-toastify';
import styles from "../../../styles/FormFinishEvent.module.css";

const FormFinishEvent = ({ datosForm, datosFormFinishEvent, onClose, setIsCardVisible, eventStatus }) => {
  const [products, setProducts] = useState(
    datosForm.productos.map((product) => ({
      ...product,
      cantidad_retornada: 0, // Inicializa la cantidad devuelta en 0
      idProductosEnEvento: null, // Inicializa el id de productos-en-eventos como null
    }))
  );

  // Obtener los productos asociados al evento al cargar el componente
  useEffect(() => {

    //console.log('cantidad_faltante' + JSON.stringify(datosForm, null, 2))

    const fetchEventProducts = async () => {
      try {
        //obtnemos por medio del id del evento los id de los productos-en-eventos
        const response = await fetch(`/api/productos-en-eventos?filters[evento][id][$eq]=${datosForm.evento.id}`);
        const data = await response.json();
        //setEventProducts(data.data); // Guarda los productos relacionados al evento


        // Verificar que hay datos suficientes antes de asignar IDs
        if (!data.data || data.data.length === 0) {
            console.warn('No se encontraron productos en el evento.');
            return;
        }
    
        // Combinar los datos de eventProducts con products asignando IDs de manera secuencial
        const updatedProducts = products.map((product, index) => (
          //console.log('product.cantidad_retornada ' + product.cantidad_retornada),
          //console.log('product.cantidad_faltante ' + datosFormFinishEvent[index].cantidad_faltante),
          //console.log('product.cantidad_faltante - cantidad_retornada ' + (datosFormFinishEvent[index].cantidad_faltante - product.cantidad_retornada)),
          {
            ...product,
            //cantidad_retornada: eventStatus === "Finalizado Parcialmente" ? (datosFormFinishEvent[index].cantidad_faltante + product.cantidad_retornada) : 0,
            idProductosEnEvento: data.data[index] ? data.data[index].id : null, // Asignar el id correspondiente o null si no hay suficientes datos
        }));

        setProducts(updatedProducts); // Actualizar el estado de products

      } catch (error) { 
        console.error('Error al obtener los productos del evento:', error);
      }
    };

    fetchEventProducts();
  }, [datosForm.evento.id]);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calcular la cantidad faltante y determinar el estatus
    const updatedProducts = products.map((product, index) => {

      let cantidad_faltante, cantidad_retornada = 0;
      let estatus = "";

      if(eventStatus === "En curso" || eventStatus === "Programado"){

        cantidad_faltante = product.cantidad_retornada !== product.quantity ? Math.max(product.quantity - product.cantidad_retornada, 0) : 0 ;
        cantidad_retornada = product.cantidad_retornada;
        estatus = cantidad_retornada === product.quantity ? "Devuelto" : "Faltante";

      }else if(eventStatus === "Finalizado Parcialmente"){
        cantidad_faltante = Math.max(product.quantity - (datosFormFinishEvent.productos[index]?.cantidad_retornada + product.cantidad_retornada), 0);
        cantidad_retornada = (datosFormFinishEvent.productos[index]?.cantidad_retornada + product.cantidad_retornada);
        estatus = cantidad_retornada === product.quantity ? "Devuelto" : "Faltante";
      }

      return {
        id: product.idProductosEnEvento, // Usar el id de productos-en-eventos
        cantidad_retornada,//product.cantidad_retornada,
        cantidad_faltante,
        estatus, // Agregar el campo estatus
      };
    });

    // Verificar si todos los productos están "Devueltos"
    const todosDevueltos = updatedProducts.every(
        (product) => product.estatus === "Devuelto"
    );

    // Verificar si hay productos "Faltante"
    const hayFaltantes = updatedProducts.some(
        (product) => product.estatus === "Faltante"
    );

    try {

        // Actualizar cada producto individualmente
        const updatePromises = updatedProducts.map((product) => {
          return fetch(`/api/productos-en-eventos/${product.id}`, {
              method: 'PUT',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: {
                    cantidad_retornada: product.cantidad_retornada,
                    cantidad_faltante: product.cantidad_faltante,
                    estatus: product.estatus, // Incluir el estatus en la actualización
                },
              }),
          });
        });

        // Esperar a que todas las actualizaciones se completen
        const responses = await Promise.all(updatePromises);
        console.log(JSON.stringify(responses, null, 2));

        const allOk = responses.every((response) => response.ok);

        if (!allOk) throw new Error('Error al actualizar algunos productos');

        // Determinar el estatus del evento
        let estatusEvento;
        if (todosDevueltos) {
        estatusEvento = "Finalizado";
        } else if (hayFaltantes) {
        estatusEvento = "Finalizado Parcialmente";
        }

        // Actualizar el estatus del evento
        const response = await fetch(`/api/eventos/${datosForm.evento.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: {
            estatus: estatusEvento, // Actualizar el estatus del evento
            },
        }),
        });

        console.log("response ***" + JSON.stringify(response, null, 2))

        if (!response.ok) throw new Error('Error al actualizar el evento');

        // Mostrar alerta según el estatus del evento
        if (estatusEvento === "Finalizado") {

            onClose(true);
            setIsCardVisible(false);
            toast.success('Todos los productos han sido devueltos'); // Notificación de éxito

        } else if (estatusEvento === "Finalizado Parcialmente") {
            
            onClose(true);
            setIsCardVisible(false);
            toast.warning('Algunos productos faltan por devolver'); // Notificación de éxito
        }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al actualizar los productos');
    }
  }; 

   // Manejar el cambio en la cantidad devuelta <TextInput>
   const handleQuantityChange = (id, value) => {
    const FormUpdatedProducts = products.map((product) =>
      product.id === id ? { ...product, cantidad_retornada: value } : product
    );
    setProducts(FormUpdatedProducts);
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Validación de devolución de productos</h2>
      <p>Confirma que cada producto haya sido devuelto correctamente con su cantidad correspondiente.</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Cantidad Retornada</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td>{product.attributes.Sku}</td>
              <td>{product.attributes.Nombre}</td>
              <td>{product.quantity}</td>
              <td className={styles.tdInput}>
                <TextInput
                  label="Retorno"
                  type="number"
                  value={datosFormFinishEvent[index]?.productos.cantidad_faltante}
                  onChange={(e) =>
                    handleQuantityChange(product.id, parseInt(e.target.value, 10))
                  }            
                  min={1}
                  max={eventStatus === "Finalizado Parcialmente" ? datosFormFinishEvent[index]?.productos.cantidad_faltante : product.quantity }
                  className={styles.input}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className={styles.button} onClick={handleSubmit}>
        Aceptar
      </button>
    </div>
  );
};

export default FormFinishEvent;