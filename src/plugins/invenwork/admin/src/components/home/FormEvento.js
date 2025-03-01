import React, { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, TextInput, Typography, Grid, GridItem, Box, IconButton } from '@strapi/design-system';
import { Search } from '@strapi/icons';

const FormEvento = ({ setIsFormVisible, setIsCardVisible, setDatosForm }) => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const searchContainerRef = useRef(null);
  const [horaFormateada, setHoraFormateada] = useState("09:10");
/*   let HoraInicioFormat = new Date(); */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
         // Función para formatear la hora
        const formatearHora = (hora) => {
            // Dividir la hora en horas y minutos
            const [horas, minutos] = hora.split(":");
    
            // Crear un objeto Date y establecer la hora y minutos
            const fecha = new Date();
            fecha.setHours(horas);
            fecha.setMinutes(minutos);
            fecha.setSeconds(0);
            fecha.setMilliseconds(0);
    
            // Obtener las partes de la hora
            const hh = fecha.getHours().toString().padStart(2, "0");
            const mm = fecha.getMinutes().toString().padStart(2, "0");
            const ss = fecha.getSeconds().toString().padStart(2, "0");
            const SSS = fecha.getMilliseconds().toString().padStart(3, "0");
    
            // Devolver la hora formateada
            return `${hh}:${mm}:${ss}.${SSS}`;
        };
  
        // Actualizar el estado con la hora formateada
        setHoraFormateada(formatearHora(eventTime));

  }, [eventTime, startDate]); 

  // Obtener la fecha actual del sistema
  const fechaActual = new Date();

  // Obtener las fechas de inicio y fin del evento
  const fechaInicio = new Date(startDate);
  const fechaFin = new Date(endDate);

  // Determinar el estado del evento basado en las fechas
  let estatusEvento;
  if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
    estatusEvento = "En curso";
  } else if (fechaActual < fechaInicio) {
    estatusEvento = "Programado";
  }

  const handleSubmit = async (e) => {
        e.preventDefault(); // Evitar recarga de la página
        const obj = {
            nombre : eventName,
            locacion : location,
            fechaInicio : startDate,
            estatus : estatusEvento,
            fechaFin : endDate,
            HoraInicio : horaFormateada,
        }
    
        try {
        // 1️⃣ Enviar solicitud para crear el evento
        const eventoResponse = await fetch('/api/eventos', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: obj
            })
        });

        if (!eventoResponse.ok) {
          throw new Error('Error al crear el evento');
        }

        const eventoData = await eventoResponse.json();
    
        const eventId = eventoData.data.id; // ID del evento creado

        // 2️⃣ Enviar productos a ProductoEnEvento con el eventId
        const productosPromises = products.map(async (producto) => {
            console.log(producto.id + " " + producto.attributes.Nombre + " " + producto.quantity)
            return fetch('/api/productos-en-eventos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    cantidad: producto.quantity,
                    estatus: "Pendiente",
                    producto: [producto.id], // ID del producto
                    almacen: [1],
                    evento: [eventId] // Relación con el evento
                }
              })
            });
        });
    
        // Ejecutar todas las solicitudes de productos
        const productoData = await Promise.all(productosPromises);
        //console.log(JSON.stringify(productoData, null, 2));
    
        if (productoData.length === 0) {
            throw new Error('Error al agregar productos en evento');
        }

        const datosForm = {
            evento: eventoData.data,
            productos: products
        }

        //console.log(JSON.stringify(datosForm, null, 2))
    
        // 3️⃣ Enviar los datos al componente padre
        setDatosForm(datosForm); 

        setIsFormVisible(false);
        setIsCardVisible(true);
  
        //console.log('Evento y productos guardados correctamente');
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  const fetchProducts = () => {
    console.log("searchQuery "+searchQuery)

    if (searchQuery.trim() !== '') {
      fetch(`/api/productos?filters[Nombre][$contains]=${searchQuery}`)
        .then((res) => res.json())
        .then(
            (data) => {
                console.log("searchResults data" + data.data[0].attributes.Nombre)
                setSearchResults(data.data) 
            }       
        )
        .catch((error) => console.error('Error fetching products:', error));        
        console.log("searchResults " + JSON.stringify(searchResults, null, 2));

    } else {
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        fetchProducts();
    }
  };

  const addProduct = (product) => {
    if (!products.some((p) => p.id === product.id)) {
      setProducts([...products, { ...product, quantity: 1 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  // Estilos
const styles = {
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
    },
    sectionTitle: {
      marginBottom: '16px',
    },
    productListContainer: {
      maxHeight: '200px',
      overflowY: 'auto',
      width: '100%',
    },
    productList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '16px',
    },
    productItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      width: '100%',
    },
    quantityInput: {
      width: '100px',
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
    },
    floatingPreview: {
      position: 'absolute',
      top: '100%',
      left: '0',
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      padding: '8px',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
    },
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}  style={styles.form}>
        <Grid gap={4} columns={12}>
            {/* Datos del evento */}
            <GridItem col={6}>
                <Typography variant="beta" style={styles.sectionTitle}>
                Datos del evento
                </Typography>
                <TextInput label="Nombre del evento" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
                <DatePicker label="Fecha de inicio" selectedDate={startDate} onChange={setStartDate} required />
                <DatePicker label="Fecha de fin" selectedDate={endDate} onChange={setEndDate} required />
                <TextInput label="Hora del evento" value={eventTime} onChange={(e) => setEventTime(e.target.value)} type="time" required />
                <TextInput label="Locación" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </GridItem>

            {/* Buscador de productos */}
            <GridItem col={6}>
                <Typography variant="beta" style={styles.sectionTitle}>
                Productos
                </Typography>
                <div style={styles.searchContainer}>
                  <TextInput
                      label="Buscador de productos"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      endAction={
                      <IconButton onClick={fetchProducts} icon={<Search />} label="Buscar" />
                      }
                  />
                  {searchResults.length > 0 && (
                      <Box style={styles.floatingPreview}>
                      {searchResults.map((product) => (
                          <div 
                              key={product.id} 
                              onClick={() => addProduct(product)} 
                              style={{
                                  padding: "10px",
                                  margin: "5px",
                                  backgroundColor: hoveredItem === product.id ? '#f0f0f0' : 'white', // Cambia el color si está en hover
                                  transition: 'background-color 0.3s ease',
                              }}
                              onMouseEnter={() => setHoveredItem(product.id)} // Actualiza hoveredItem con el índice
                              onMouseLeave={() => setHoveredItem(null)} // Restablece hoveredItem a null
                          >
                          {"ID " + product.id + " " + product.attributes.Nombre}
                          </div>
                      ))}
                      </Box>
                  )}
                </div>

                {/* Listado de productos */}
                <Box style={styles.productListContainer}>
                  <Box style={styles.productList}>
                      {products.map((product) => (
                      <Box key={product.id} style={styles.productItem}>
                          <Typography>{product.attributes.Nombre}</Typography>
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
                          style={styles.quantityInput}
                          />
                          <Button variant="danger" onClick={() => removeProduct(product.id)}>
                          Eliminar
                          </Button>
                      </Box>
                      ))}
                  </Box>
                </Box>
            </GridItem>

           {/* Botón Enviar */}
            <GridItem col={3} style={styles.submitButtonContainer}>
                <Button type="submit" style={styles.submitButton}>
                    Enviar
                </Button>
            </GridItem>
        </Grid>
      </form>
    </div>
  );
};



export default FormEvento;
