import React, { useState, useEffect } from 'react';
import { HeaderLayout, ContentLayout, Button, DatePicker } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { useHistory } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import GetProductList from '../../components/productos/GetProductList';
import FormProduct from '../../components/productos/FormProduct';
import pluginId from '../../pluginId';

const Productos = () => {
  const history = useHistory();
  const [data, setData] = useState({
    Nombre: "",
    Descripcion: "",
    Sku: "",
    Precio: 0,
    categoria: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleGoBack = () => {
    setIsFormVisible(false);
  };

  const handleCreateNewProduct = () => {
    setIsFormVisible(true);
  };

  return (
    <div>
      <HeaderLayout
        title="Equipos"
        subtitle="Stock de equipos"
        navigationAction={
          <Button onClick={handleGoBack} startIcon={<ArrowLeft />} variant="tertiary">
            Atrás
          </Button>
        }
        primaryAction={
          !isFormVisible && (
            <Button onClick={handleCreateNewProduct} variant="default">
              Crear nuevo producto
            </Button>
          )
        }
      />
      <ContentLayout>
        {isFormVisible && (
          <FormProduct
            setIsFormVisible={setIsFormVisible}
          />
        )}
        {!isFormVisible && (
          <GetProductList/>
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

export default Productos;