import React, { useState, useEffect } from 'react';
import { HeaderLayout, ContentLayout, Button, DatePicker } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { useHistory } from 'react-router-dom';
import FormEvento from '../../components/home/FormEvento';
import EventList from '../../components/home/EventList';
import EventCard from '../../components/home/EventCard';
import { ToastContainer, toast } from 'react-toastify';
import pluginId from '../../pluginId';

const HomePage = () => {
  const history = useHistory();
  const [datosForm, setDatosForm] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [eventStatus, setEventStatus] = useState(false);

  /* useEffect(() => {
    console.log('isCardVisible '+ isCardVisible)
    console.log('datosForm '+ JSON.stringify(datosForm, null, 2))
  }, [isCardVisible, datosForm]) */
  

  // Array de datos para las tarjetas (simulación)
  const cardsData = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `Evento ${index + 1}`,
    date: `2023/10/${index + 1}`,
    time: '10:00 AM',
    location: `Locación ${index + 1}`,
  }));

  const handleGoBack = () => {
    setIsFormVisible(false);
    setIsCardVisible(false);
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
            setIsCardVisible={setIsCardVisible}
            eventStatus={eventStatus}
          />
        )}
        {!isFormVisible && !isCardVisible && (
          <EventList
            setIsCardVisible={setIsCardVisible}
            setDatosForm={setDatosForm}
            setEventStatus={setEventStatus}
          />
        )}
      </ContentLayout>
      <ToastContainer />
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