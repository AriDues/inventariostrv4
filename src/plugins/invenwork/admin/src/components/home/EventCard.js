import React, { useState, useEffect, useRef } from "react";
import { Button, Typography } from "@strapi/design-system";
import Modal from "./Modal";
import QuestionFinishEvent from "./formulariosModal/QuestionFinishEvent";
import FormFinishEvent from "./formulariosModal/FormFinishEvent";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PDFTemplate from '../pdf/PDFTemplate';

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
  cardContentBold: {
    fontWeight: "bold"
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
  tableCellReturned: {
    padding: "12px",
    textAlign: "left",
    color: "#3cc72c",
  },
  tableCellMissing: {
    padding: "12px",
    textAlign: "left",
    color: "#dc3545",
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

  const handleGeneratePDF = async () => {
    try {
      // 1. Ocultar el contenido del PDF en la UI
      const pdfElement = document.getElementById('pdf-content');

      // 2. Capturar el HTML como imagen
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
      });

      // 3. Generar el PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190; // Ancho máximo en mm (A4)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`evento-resumen.pdf`);

      // 4. Mostrar el contenido nuevamente
      pdfElement.style.visibility = 'visible';
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

    //console.log("event card datos form ***** " + JSON.stringify(datosForm, null, 2));

    const [isYesFinishevent, setIsYesFinishevent] = useState(false);
    const [datosFormFinishEvent, setDatosFormFinishEvent] = useState([]);
    const [productosFormFinishEvent, setProductosFormFinishEvent] = useState([]);
    const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

    useEffect(() => {

      //console.log(" datosForm  " + JSON.stringify(datosForm, null, 2));

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

          const categoriaCatidadUpdateProducts = await Promise.all(
            datosForm.productos.map(async (product, index) => {
              const productData = data.data[index];
              let categoria = 'Sin categoría';
        
              try {
                const catResponse = await fetch(`/api/productos/${product.id}?populate=categoria`);
                const catData = await catResponse.json();

                categoria = catData?.data?.attributes?.categoria?.data?.attributes?.Nombre || 'Sin categoría';

              } catch (error) {
                console.error('Error obteniendo categoría:', error);
              }
        
              return {
                ...product,
                cantidad_retornada: productData?.attributes?.cantidad_retornada || 0,
                cantidad_faltante: productData?.attributes?.cantidad_faltante || 0,
                categoria: categoria
              };
            })
          );

          const datosFormUpdate = {
            ...datosForm,
            productos: categoriaCatidadUpdateProducts,
          }

          setProductosFormFinishEvent(categoriaCatidadUpdateProducts);
          setDatosFormFinishEvent(datosFormUpdate);

        } catch (error) { 
          console.error('Error al obtener los productos del evento:', error);
        }
      };
  
      fetchEventProducts();
      
    }, []);

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
                            <strong style={styles.cardContentBold}>Evento:</strong> {datosForm.evento.attributes.nombre}
                        </p>
                        <p style={styles.cardContent}>
                            <strong style={styles.cardContentBold}>Fecha inicial:</strong> {datosForm.evento.attributes.fechaInicio}
                        </p>
                        <p style={styles.cardContent}>
                            <strong style={styles.cardContentBold}>Hora inicio:</strong> {datosForm.evento.attributes.HoraInicio}
                        </p>
                        <p style={styles.cardContent}>
                            <strong style={styles.cardContentBold}>Fecha Final:</strong> {datosForm.evento.attributes.fechaFin}
                        </p>
                        <p style={styles.cardContent}>
                            <strong style={styles.cardContentBold}>Hora fin:</strong> {datosForm.evento.attributes.HoraFin}
                        </p>
                        <p style={styles.cardContent}>
                            <strong style={styles.cardContentBold}>Locación:</strong> {datosForm.evento.attributes.locacion}
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
                                {(eventStatus === "Finalizado" || eventStatus === "Finalizado Parcialmente") && (<th style={styles.tableHeader}>Cantidad Devuelta</th>)}
                                {(eventStatus === "Finalizado Parcialmente") && (<th style={styles.tableHeader}>Cantidad Faltante</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {productosFormFinishEvent.map((producto) => (
                                <tr key={producto.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{producto.attributes.Sku}</td>
                                <td style={styles.tableCell}>{producto.attributes.Nombre}</td>
                                <td style={styles.tableCell}>{producto.quantity}</td>
                                {(eventStatus === "Finalizado" || eventStatus === "Finalizado Parcialmente") && (<td style={styles.tableCell}>{producto.cantidad_retornada != null ? producto.cantidad_retornada : 0 }</td>)}
                                {(eventStatus === "Finalizado Parcialmente") && (<td style={styles.tableCell}>{producto.cantidad_faltante != null ? producto.cantidad_faltante : 0 }</td>)}
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
                            <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                              Generar orden de retorno parcial
                            </button>
                            <button onClick={toggleFirstModal} style={styles.finishEventButtonLeft}>
                              Finalizar evento
                            </button>
                          </>
                        )} 

                        {eventStatus === "Finalizado" && (
                          <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                            Generar orden de retorno
                          </button>
                        )}                                                                      

                        {eventStatus !== "Finalizado" && (
                          eventStatus !== "Finalizado Parcialmente" && (
                          <>
                            <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                              Generar orden de salida
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
            {/* Contenedor oculto en la UI (pero no con display: none) */}
            
            <div style={{ position: 'absolute', left: '-9999px', visibility: 'visible' }}>
              <PDFTemplate data={datosFormFinishEvent} eventStatus={eventStatus}/>
            </div>
            
        </>
    );
};

export default EventCard;