import React, { useState, useEffect, useRef } from "react";
import { Button, Typography, TextInput, IconButton } from "@strapi/design-system";
import { Search } from '@strapi/icons';
import Modal from "./Modal";
import QuestionFinishEvent from "./formulariosModal/QuestionFinishEvent";
import FormFinishEvent from "./formulariosModal/FormFinishEvent";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PDFTemplate from '../pdf/PDFTemplate';

const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

// Estilos actualizados
const styles = {
  mainContainer: {
    display: 'flex',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '3rem',
  },
  leftCard: {
    flex: 0.4,
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    height: 'fit-content',
  },
  rightCard: {
    flex: 0.6,
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
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
    marginBottom: "10px",
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
    display: "flex",
    flexDirection: 'column',
    gap: '1rem',
    marginTop: "16px",
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
    marginRight: "6px",
  },
  finishEventButtonLeft: {
    backgroundColor: "#d58700",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchInputContainer: {
    position: 'relative',
    margin: '20px 0',
  },
  searchInputWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '10px 40px 10px 15px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '16px',
  },
  floatingPreview: {
    width: '100%',
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
    marginTop: '5px',
    marginBottom: "2rem",
  },
  resultItemTable: {
    padding: "10px",
    margin: "5px",
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'block'
  },
  invisibleTable: {
    width: '100%',
    borderCollapse: 'collapse',
    border: 'none'
  },
  leftColumn: {
    textAlign: 'left',
    verticalAlign: 'middle',
    padding: '8px 0',
    border: 'none'
  },
  rightColumnTable: {
    textAlign: 'right',
    verticalAlign: 'middle',
    width: 'auto',
    border: 'none'
  },
  inputButtonContainer: {
    display: 'flex',
    alignItems: 'end',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  quantityInputTable: {
    width: '80px',
  },
  cardContentContainerSearchPProduct: {
    position: 'relative',
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    gap: "24px",
    marginBottom: "1rem",
  },
  closeIconButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    zIndex: 1
  },
};

const EventCard = ({ datosForm, setIsCardVisible, eventStatus }) => {
  const handleGeneratePDF = async () => {
    try {
      const pdfElement = document.getElementById('pdf-content');
      const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`evento-resumen.pdf`);
      pdfElement.style.visibility = 'visible';
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  const [isYesFinishevent, setIsYesFinishevent] = useState(false);
  const [datosFormFinishEvent, setDatosFormFinishEvent] = useState([]);
  const [productosFormFinishEvent, setProductosFormFinishEvent] = useState([]);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [moreProducts, setMoreProducts] = useState(false);

  useEffect(() => {
    const fetchEventProducts = async () => {
      try {
        const response = await fetch(`/api/productos-en-eventos?filters[evento][id][$eq]=${datosForm.evento.id}`);
        const data = await response.json();

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

        const datosFormUpdate = { ...datosForm, productos: categoriaCatidadUpdateProducts };
        setProductosFormFinishEvent(categoriaCatidadUpdateProducts);
        setDatosFormFinishEvent(datosFormUpdate);
      } catch (error) { 
        console.error('Error al obtener los productos del evento:', error);
      }
    };
    fetchEventProducts();
  }, []);

  const toggleFirstModal = () => setIsFirstModalOpen((prev) => !prev);
  const toggleSecondModal = () => setIsSecondModalOpen((prev) => !prev);

  const handleFirstModalClose = (response) => {
    if (response) {
      setIsYesFinishevent(true);
      setIsFirstModalOpen(false);
      setTimeout(() => setIsSecondModalOpen(true), 300);
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchProducts();
    }
  };

  const fetchProducts = () => {
    if (searchQuery.trim() !== '') {
      fetch(`/api/productos?filters[Nombre][$contains]=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.data))
        .catch((error) => console.error('Error fetching products:', error));
    } else {
      setSearchResults([]);
    }
  };

  const addProduct = (product) => {
    if (!products.some((p) => p.id === product.id)) {
      setProducts([...products, { ...product, quantity: 1 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSecondModalClose = () => toggleSecondModal();

  return (
    <>
      {isEmpty(datosForm) ? (
        <div style={styles.leftCard}>
          <h2 style={styles.cardTitle}>Evento sin información</h2>
          <div style={styles.buttonContainerRow}>
            <button onClick={() => setIsCardVisible(false)} style={styles.closeButtonRight}>
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.mainContainer}>
          {/* Columna Izquierda - Detalles y Botones */}
          <div style={styles.leftCard}>
            <h2 style={styles.cardTitle}>Evento {eventStatus}</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Evento:</strong> {datosForm.evento.attributes.nombre}
              </p>                        
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Locación:</strong> {datosForm.evento.attributes.locacion}
              </p>
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Fecha de inicio:</strong> {datosForm.evento.attributes.fechaInicio}
              </p>
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Hora de inicio:</strong> {datosForm.evento.attributes.HoraInicio}
              </p>
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Fecha de fin:</strong> {datosForm.evento.attributes.fechaFin}
              </p>
              <p style={styles.cardContent}>
                <strong style={styles.cardContentBold}>Hora de fin:</strong> {datosForm.evento.attributes.HoraFin}
              </p> 
            </div>

            <div style={styles.buttonContainerRow}>
              <div>
                {eventStatus === "Finalizado Parcialmente" && (
                  <>
                    <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                      Orden retorno parcial
                    </button>
                    <button onClick={toggleFirstModal} style={styles.finishEventButtonLeft}>
                      Finalizar evento
                    </button>
                  </>
                )} 

                {eventStatus === "Finalizado" && (
                  <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                    Orden de retorno
                  </button>
                )}                                                                      

                {eventStatus !== "Finalizado" && eventStatus !== "Finalizado Parcialmente" && (
                  <>
                    <button onClick={handleGeneratePDF} style={styles.printButtonLeft}>
                      Orden de salida
                    </button>
                    <button onClick={toggleFirstModal} style={styles.finishEventButtonLeft}>
                      Finalizar evento
                    </button>
                  </>
                )}                    
              </div>
              <button onClick={() => setIsCardVisible(false)} style={styles.closeButtonRight}>
                Cerrar
              </button>
            </div>
          </div>

          {/* Columna Derecha - Productos */}
          <div style={styles.rightCard}>
            <h3 style={styles.productTitle}>Equipos Asignados</h3>
            <table style={styles.productTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>SKU</th>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Cantidad solicitada</th>
                  {(eventStatus === "Finalizado" || eventStatus === "Finalizado Parcialmente") && (
                    <th style={styles.tableHeader}>Cantidad Devuelta</th>
                  )}
                  {eventStatus === "Finalizado Parcialmente" && (
                    <th style={styles.tableHeader}>Cantidad Faltante</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {productosFormFinishEvent.map((producto) => (
                  <tr key={producto.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{producto.attributes.Sku}</td>
                    <td style={styles.tableCell}>{producto.attributes.Nombre}</td>
                    <td style={styles.tableCell}>{producto.quantity}</td>
                    {(eventStatus === "Finalizado" || eventStatus === "Finalizado Parcialmente") && (
                      <td style={styles.tableCell}>{producto.cantidad_retornada ?? 0}</td>
                    )}
                    {eventStatus === "Finalizado Parcialmente" && (
                      <td style={styles.tableCell}>{producto.cantidad_faltante ?? 0}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {!moreProducts && (
              <button onClick={() => setMoreProducts(true)} style={styles.printButtonLeft}>
                Asignar más equipos
              </button>  
            )}

            {moreProducts && (
              <div style={styles.cardContentContainerSearchPProduct}>
                <button 
                  onClick={() => setMoreProducts(false)}
                  style={styles.closeIconButton}
                  aria-label="Cerrar"
                >
                  <svg
                    style={{ width: '24px', height: '24px', color: '#666' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                
                <div style={styles.searchInputContainer}>
                  <div style={styles.searchInputWrapper}>
                    <TextInput
                      label="Buscar equipo"
                      placeholder="Buscar equipo..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      style={styles.searchInput}
                      endAction={<IconButton onClick={fetchProducts} icon={<Search />} label="Buscar" />}
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div style={styles.floatingPreview}>
                      {searchResults.map((product) => (
                        <div 
                          key={product.id} 
                          style={{
                            ...styles.resultItemTable,
                            backgroundColor: hoveredItem === product.id ? '#f0f0f0' : 'white'
                          }}
                          onMouseEnter={() => setHoveredItem(product.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <table style={styles.invisibleTable}>
                            <tbody>
                              <tr>
                                <td style={styles.leftColumn}>
                                  <div>ID: {product.id}</div>
                                  <div>{product.attributes.Nombre}</div>
                                </td>
                                <td style={styles.rightColumnTable}>
                                  <div style={styles.inputButtonContainer}>
                                    <TextInput
                                      label="Cantidad"
                                      type="number"
                                      value={product.quantity}
                                      onChange={(e) => {
                                        const updatedProducts = products.map((p) =>
                                          p.id === product.id ? { ...p, quantity: e.target.value } : p
                                        );
                                        setProducts(updatedProducts);
                                      }}
                                      min={1}
                                      style={styles.quantityInputTable}
                                    />
                                    <button 
                                      onClick={() => addProduct(product)}
                                      style={styles.printButtonLeft}
                                    >
                                      Agregar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      {isFirstModalOpen && 
        <Modal onClose={toggleFirstModal}>
          <QuestionFinishEvent onClose={toggleFirstModal} onConfirm={handleFirstModalClose}/>
        </Modal>
      }
      {isYesFinishevent && isSecondModalOpen && 
        <Modal onClose={toggleSecondModal}>
          <FormFinishEvent 
            datosForm={datosForm}
            datosFormFinishEvent={datosFormFinishEvent}
            onClose={toggleSecondModal}
            setIsCardVisible={setIsCardVisible}
            eventStatus={eventStatus}
          />
        </Modal>
      }

      {/* PDF Template */}
      <div style={{ position: 'absolute', left: '-9999px', visibility: 'visible' }}>
        <PDFTemplate data={datosFormFinishEvent} eventStatus={eventStatus}/>
      </div>
    </>
  );
};

export default EventCard;