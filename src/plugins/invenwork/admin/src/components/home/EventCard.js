import React, { useState, useEffect } from "react";
import { Button, Typography } from "@strapi/design-system";
import Modal from "./Modal";
import QuestionFinishEvent from "./formulariosModal/QuestionFinishEvent";
import FormFinishEvent from "./formulariosModal/FormFinishEvent";
import jsPDF from 'jspdf';

const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

// Estilos en línea (depurados)
const styles = {
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    maxWidth: "800px", // Ajusta el ancho según sea necesario
    margin: "0 auto",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  cardContentContainer: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    display: "flex",
    gap: "24px", // Espacio entre las columnas
  },
  column: {
    flex: 1, // Cada columna ocupa el mismo espacio
  },
  cardContent: {
    fontSize: "16px",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  productTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  productTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #e0e0e0",
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0",
  },
  tableCell: {
    padding: "12px",
    textAlign: "left",
  },
  buttonContainerRow: {
    display: "flex", // Usar flexbox para alinear los botones en una fila
    justifyContent: "space-between", // Separar los botones a los extremos
    marginTop: "16px", // Mantener el margen superior
  },
  closeButtonRight: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  printButtonLeft: {
    backgroundColor: "#4945ff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight : "10px",
  },
  finishEventButtonLeft: {
    backgroundColor: "#d58700",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

const EventCard = ({ datosForm, setIsCardVisible, eventStatus}) => {

    //console.log("event card datos form ***** " + JSON.stringify(datosForm, null, 2));

    const [isYesFinishevent, setIsYesFinishevent] = useState(false);
    const [datosFormFinishEvent, setDatosFormFinishEventt] = useState([]);
    const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

    useEffect(() => {

      const fetchEventProducts = async () => {
        try {
          //obtnemos por medio del id del evento los id de los productos-en-eventos
          const response = await fetch(`/api/productos-en-eventos?filters[evento][id][$eq]=${datosForm.evento.id}`);
          const data = await response.json();
          // Verificar que hay datos suficientes antes de asignar IDs
          if (!data.data || data.data.length === 0) {
              console.warn('No se encontraron productos en el evento.');
              return;
          }
      
          // Combinar los datos de eventProducts con products asignando IDs de manera secuencial
          const updatedProducts = datosForm.productos.map((product, index) => ({
              ...product,
              cantidad_retornada: data.data[index] ? data.data[index].attributes.cantidad_retornada : 0, // Asignar el id correspondiente o null si no hay suficientes datos
              cantidad_faltante: data.data[index] ? data.data[index].attributes.cantidad_faltante : 0, // Asignar el id correspondiente o null si no hay suficientes datos
          }));

          setDatosFormFinishEventt(updatedProducts);

          console.log("data.data ****" + JSON.stringify(data.data, null, 2));
          console.log("updatedProducts ****" + JSON.stringify(updatedProducts, null, 2));

        } catch (error) { 
          console.error('Error al obtener los productos del evento:', error);
        }
      };
  
      fetchEventProducts();
      
    }, []);

    useEffect(() => {

      console.log("datosForm ****" + JSON.stringify(datosForm, null, 2));
      console.log("datosFormFinishEvent ****" + JSON.stringify(datosFormFinishEvent, null, 2));

    }, [datosFormFinishEvent])
    
    

    // Función para abrir/cerrar el modal
    const toggleFirstModal = () => setIsFirstModalOpen((prev) => !prev);
    const toggleSecondModal = () => setIsSecondModalOpen((prev) => !prev);

    const handleFirstModalClose = (response) => {
      if (response) {
        setIsYesFinishevent(true);
        setIsFirstModalOpen(false);
        setTimeout(() => setIsSecondModalOpen(true), 300);
      }
    };

    const handleSecondModalClose = () => {
      toggleSecondModal();
    };

    const handlePrintPDF = (data) => {
      const doc = new jsPDF();
    
      // Cabecera del documento
      doc.setFontSize(18);
      doc.text('Nota de Entrega', 10, 10);
    
      // Información del evento
      doc.setFontSize(12);
      const evento = datosForm.evento || {};
      const eventoAttrs = evento.attributes || {};
    
      doc.text(`Nombre del evento: ${eventoAttrs.nombre || 'N/A'}`, 10, 20);
      doc.text(`Fecha de inicio: ${eventoAttrs.fechaInicio || 'N/A'}`, 10, 30);
      doc.text(`Fecha de fin: ${eventoAttrs.fechaFin || 'N/A'}`, 10, 40);
      doc.text(`Hora del evento: ${eventoAttrs.horaInicio || 'N/A'}`, 10, 50);
      doc.text(`Locación: ${eventoAttrs.locacion || 'N/A'}`, 10, 60);
    
      // Título de la tabla
      doc.setFontSize(16);
      doc.text('Productos Asignados:', 10, 74);
    
      // Configuración de la tabla
      const startX = 10;
      let startY = 80;
      const cellHeight = 10;
    
      // Definir anchos de columnas
      const colWidths = {
        sku: 40,
        nombre: 70,
        cantidad: 30,
      };
    
      // Dibujar encabezado de la tabla
      doc.setFontSize(12);
        // 1. Color de fondo = negro
      doc.setFillColor(0, 0, 0);          // Relleno negro
      // 2. Color del texto = blanco
      doc.setTextColor(255, 255, 255);    // Texto blanco
  
      // Datos de las cabeceras (texto, posición x, ancho)
      const headers = [
        { text: 'SKU',      x: startX,                                          width: colWidths.sku },
        { text: 'Nombre',   x: startX + colWidths.sku,                          width: colWidths.nombre },
        { text: 'Cantidad', x: startX + colWidths.sku + colWidths.nombre,       width: colWidths.cantidad },
      ];
  
      // Dibujar cada celda de la cabecera
      headers.forEach((header) => {
        doc.rect(header.x, startY, header.width, cellHeight, 'FD'); 
        // 'FD' => fill & draw (rellenar y dibujar el borde)
        // Agregar el texto (2 px de margen horizontal y ~3 px vertical)
        doc.text(header.text, header.x + 2, startY + cellHeight - 3);
      });
  
      // Pasamos a la siguiente línea, debajo del encabezado
      startY += cellHeight;
  
      // --------------------------------
      // DIBUJAR FILAS DE LA TABLA
      // --------------------------------
  
      // 3. Revertir color de texto a negro para el contenido
      doc.setTextColor(0, 0, 0);
    
      // Dibujar cada fila de productos
      datosForm.productos?.forEach((producto) => {
        const productoAttrs = producto.attributes || {};
        const row = [
          productoAttrs.Sku || 'N/A',
          productoAttrs.Nombre || 'N/A',
          `${producto.quantity || '0'}`,
        ];
    
        let currentX = startX;
        row.forEach((cellText, index) => {
          // Obtener ancho de celda según columna
          const width = Object.values(colWidths)[index];
          // Dibujar borde de la celda
          doc.rect(currentX, startY, width, cellHeight);
          // Agregar texto con margen
          doc.text(cellText, currentX + 2, startY + cellHeight - 3);
          currentX += width;
        });
        startY += cellHeight;
      });  
      
      // ---------------------------
      // Agregar casillas para firmas
      // ---------------------------
      const pageWidth = doc.internal.pageSize.getWidth();
      const signatureBoxWidth = 60; // ancho de cada casilla
      const signatureBoxHeight = 10; // alto de cada casilla
      const gapBetweenBoxes = 20; // separación entre las casillas
    
      // Definir posición vertical para las firmas (se deja un espacio luego de la tabla)
      const signatureY = startY + 10;
    
      // Posición para la primera casilla (Administrador de Almacén)
      const leftBoxX = 10;
      // Posición para la segunda casilla (Operario)
      const rightBoxX = leftBoxX + signatureBoxWidth + gapBetweenBoxes;
    
      // Dibujar casilla para "Administrador de Almacén"
      doc.rect(leftBoxX, signatureY, signatureBoxWidth, signatureBoxHeight);
      // Agregar etiqueta debajo de la casilla (centrada aproximadamente)
      doc.text('Administrador de Almacén', leftBoxX, signatureY + signatureBoxHeight + 10);
    
      // Dibujar casilla para "Operario"
      doc.rect(rightBoxX, signatureY, signatureBoxWidth, signatureBoxHeight);
      // Agregar etiqueta debajo de la casilla (centrada aproximadamente)
      doc.text('Operario', rightBoxX, signatureY + signatureBoxHeight + 10);
  
      // Agregar Footer de información
      doc.setFontSize(10);
      doc.text('Generado desde Sistema de Inventario', 10, startY + 90);
    
      // Guardar el PDF
      doc.save('nota_de_entrega.pdf');
    };

    return (
        <>
            {isEmpty(datosForm) ? (
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Evento sin información</h2>
                    <div style={styles.cardContentContainer}>

                    </div>
                    <div style={styles.buttonContainerRow}>
                        <button onClick={() => setIsCardVisible(false)} style={styles.closeButtonRight}>
                            Cerrar
                        </button>
                    </div>
                </div>
            ) : (
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Evento {eventStatus}</h2>
                    <div style={styles.cardContentContainer}>
                        {/* Columna 1: Detalles del evento */}
                        <div style={styles.column}>
                        <p style={styles.cardContent}>
                            <strong>Evento:</strong> {datosForm.evento.attributes.nombre}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Inicio:</strong> {datosForm.evento.attributes.fechaInicio}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Fin:</strong> {datosForm.evento.attributes.fechaFin}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Hora inicio:</strong> {datosForm.evento.attributes.HoraInicio}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Locación:</strong> {datosForm.evento.attributes.locacion}
                        </p>
                        </div>

                        {/* Columna 2: Productos asignados */}
                        <div style={styles.column}>
                        <h3 style={styles.productTitle}>Productos Asignados</h3>
                        <table style={styles.productTable}>
                            <thead>
                            <tr>
                                <th style={styles.tableHeader}>SKU</th>
                                <th style={styles.tableHeader}>Nombre</th>
                                <th style={styles.tableHeader}>Cantidad solicitada</th>
                                <th style={styles.tableHeader}>Cantidad Devuelta</th>
                            </tr>
                            </thead>
                            <tbody>
                            {datosFormFinishEvent.map((producto) => (
                                <tr key={producto.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{producto.attributes.Sku}</td>
                                <td style={styles.tableCell}>{producto.attributes.Nombre}</td>
                                <td style={styles.tableCell}>{producto.quantity}</td>
                                <td style={styles.tableCell}>{producto.cantidad_retornada != null ? producto.cantidad_retornada : 0 }</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    <div style={styles.buttonContainerRow}>
                      <div >

                        {eventStatus === "Finalizado Parcialmente" && (
                          <>
                            <button onClick={()=>handlePrintPDF(datosFormFinishEvent)} style={styles.printButtonLeft}>
                              Generar nota de devolución
                            </button>
                            <button onClick={toggleFirstModal} style={styles.finishEventButtonLeft}>
                              Finalizar evento
                            </button>
                          </>
                        )} 

                        {eventStatus === "Finalizado" && (
                          <button onClick={()=>handlePrintPDF(datosFormFinishEvent)} style={styles.printButtonLeft}>
                            Generar nota de devolución
                          </button>
                        )}                                                                      

                        {eventStatus !== "Finalizado" && (
                          eventStatus !== "Finalizado Parcialmente" && (
                          <>
                            <button onClick={()=>handlePrintPDF(datosForm)} style={styles.printButtonLeft}>
                              Generar nota entrega
                            </button>
                            <button onClick={toggleFirstModal} style={styles.finishEventButtonLeft}>
                              Finalizar evento
                            </button>
                          </>
                        ))}                    
                      </div>
                      <button onClick={() => setIsCardVisible(false)} style={styles.closeButtonRight}>
                        Cerrar
                      </button>
                    </div>
                </div>
            )} 
            {isFirstModalOpen && 
              <Modal onClose={toggleFirstModal}>
                <QuestionFinishEvent onClose={toggleFirstModal} onConfirm={handleFirstModalClose}/>
              </Modal>
            }
            {isYesFinishevent && isSecondModalOpen && 
                <Modal onClose={toggleSecondModal}>
                  <FormFinishEvent 
                    datosForm={datosForm}
                    datosFormFinishEvent={datosFormFinishEvent} // obtener cantidad_retornada y cantidad_faltante 
                    onClose={toggleSecondModal}
                    setIsCardVisible={setIsCardVisible}
                    eventStatus={eventStatus}

                  />
                </Modal>
            }
        </>
    );
};

export default EventCard;