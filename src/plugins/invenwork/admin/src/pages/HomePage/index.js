import React, { useState, useEffect } from 'react';
import { HeaderLayout, ContentLayout, Button, DatePicker } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { useHistory } from 'react-router-dom';
import FormEvento from '../../components/home/FormEvento';
import jsPDF from 'jspdf';
import EventList from '../../components/home/EventList';
import EventCard from '../../components/home/EventCard';
import pluginId from '../../pluginId';

const HomePage = () => {
  const history = useHistory();
  const [datosForm, setDatosForm] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    console.log('isCardVisible '+ isCardVisible)
    console.log('datosForm '+ JSON.stringify(datosForm, null, 2))
  }, [isCardVisible, datosForm])
  

  // Array de datos para las tarjetas (simulación)
  const cardsData = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `Evento ${index + 1}`,
    date: `2023/10/${index + 1}`,
    time: '10:00 AM',
    location: `Locación ${index + 1}`,
  }));

  const handleGoBack = () => {
    history.goBack();
  };

  const handleCreateNewEvent = () => {
    setIsFormVisible(true);
    setIsCardVisible(false);
  };

  // Función para formatear la fecha en formato yyyy/MM/dd
  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) {
      return ''; // Si no es un objeto Date válido, devuelve una cadena vacía
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Funciones para los botones de las tarjetas
  const handleViewMore = (cardId) => {
    console.log(`Ver más detalles de la tarjeta ${cardId}`);
  };

  const handleFinish = (cardId) => {
    console.log(`Finalizar evento de la tarjeta ${cardId}`);
  };

  const handlePrintPDF = () => {
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
    <div>
      <HeaderLayout
        title="Registra el próximo evento"
        subtitle="Inventario por evento"
        navigationAction={
          <Button onClick={handleGoBack} startIcon={<ArrowLeft />} variant="tertiary">
            Atrás
          </Button>
        }
        primaryAction={
          !isFormVisible && (
            <Button onClick={handleCreateNewEvent} variant="default">
              Crear nuevo evento
            </Button>
          )
        }
      />
      <ContentLayout>
        {isFormVisible && (
          <FormEvento
            setIsFormVisible={setIsFormVisible}
            setIsCardVisible={setIsCardVisible}
            setDatosForm={setDatosForm}
          />
        )}
        {isCardVisible && (
          <EventCard
            datosForm={datosForm}
            handlePrintPDF={handlePrintPDF}
            setIsCardVisible={setIsCardVisible}
          />
        )}
        {!isFormVisible && !isCardVisible && (
          <EventList
            setIsCardVisible={setIsCardVisible}
            setDatosForm={setDatosForm}
          />
        )}
      </ContentLayout>
    </div>
  );
};

// Estilos en línea
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columnas
    gap: '16px', // Espacio entre las tarjetas
    padding: '20px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  actionButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
  },

  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    maxWidth: '800px', // Ajusta el ancho según sea necesario
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  cardContentContainer: {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '20px',
    display: 'flex',
    gap: '24px', // Espacio entre las columnas
  },
  column: {
    flex: 1, // Cada columna ocupa el mismo espacio
  },
  cardContent: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  productTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  productTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '16px',
  },
  printButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonContainerRow: {
    display: 'flex', // Usar flexbox para alinear los botones en una fila
    justifyContent: 'space-between', // Separar los botones a los extremos
    marginTop: '16px', // Mantener el margen superior
  },
  closeButtonRight: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  printButtonLeft: {
    backgroundColor: '#4945ff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default HomePage;