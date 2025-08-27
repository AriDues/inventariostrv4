import React, { useState, useEffect } from "react";
import { Button } from '@strapi/design-system';
import { Cursor } from "@strapi/icons";

const styles = {
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // 4 columnas
    gap: "16px", // Espacio entre las tarjetas
    padding: "20px",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    Cursor:"pointer"
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
  buttonContainer: {
    display: 'flex', // Usar flexbox para alinear los botones en una fila
    justifyContent: 'space-between', // Separar los botones a los extremos
    gap: "8px",
    marginTop: "12px",
  },
  actionButton: {
    backgroundColor: "#4945ff",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    marginBottom: "40px",
  },
  paginationButton: {
    backgroundColor: "#4945ff",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

const transformProducts = (products) => {
    return products.map(product => ({
        id: product.attributes.producto.data[0]?.id,
        attributes: {
            Sku: product.attributes.producto.data[0]?.attributes.Sku || "N/A",
            Nombre: product.attributes.producto.data[0]?.attributes.Nombre || "N/A"
        },
        quantity: product.attributes.cantidad
    }));
};

const EventList = ({setIsCardVisible, setDatosForm, setEventStatus}) => {
  const [events, setEvents] = useState([]); // Almacena los eventos
  const [productsInEvents, setProductsInEvents] = useState([]); // Almacena los productos en eventos
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [selectedProductsInEvents, setSelectedProductsInEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("Programado");
  const eventsPerPage = 8; // Eventos por página

  // Obtener datos de las APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener eventos con paginación  &sort=nombre:ASC
        const eventosResponse = await fetch(
          `/api/eventos?pagination[page]=${currentPage}&pagination[pageSize]=${eventsPerPage}&filters[estatus][$eq]=${selectedFilter}`
        );
        const eventosData = await eventosResponse.json();
        setEvents(eventosData.data);
        setTotalPages(eventosData.meta.pagination.pageCount);

        // Obtener IDs de los eventos de la página actual
        const eventIds = events.map((event) =>{ event.id});

        // Consultar productos en eventos para cada evento &populate[producto][fields][0]=Nombre
        const productosEnEventosPromises = eventosData.data.map(async (event) => {
            const response = await fetch(
            `/api/productos-en-eventos?filters[evento][id][$eq]=${event.id}&populate=producto&pagination[pageSize]=1000`
            );
            const data = await response.json();
            //console.log(" data ***** " + JSON.stringify(data, null, 2));
            return { event: event.id, products: data.data }; // Retornar el ID del evento y sus productos
        });

        // Esperar a que todas las consultas se completen
        const productosEnEventosResults = await Promise.all(productosEnEventosPromises);
    
        // Convertir los resultados en un formato más manejable
        const productosEnEventosMap = productosEnEventosResults.reduce((acc, { event, products }) => {
            acc[event] = products; // Asignar los productos al ID del evento
            return acc;
        }, {});

        // Actualizar el estado con los productos en eventos
        setProductsInEvents(productosEnEventosMap);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

  }, [currentPage, selectedFilter]); // Volver a cargar cuando cambie la página

  useEffect(() => {

    const orderProduct = transformProducts(selectedProductsInEvents);

    setDatosForm ({
        evento: selectedEvent,
        productos: orderProduct,
    });

    //console.log(" orderProduct***** " + JSON.stringify(orderProduct, null, 2));

    if (selectedEvent && selectedProductsInEvents.length > 0) {
        setIsCardVisible(true);
    }


  }, [selectedProductsInEvents, selectedEvent]);
  

  // Calcular la duración del evento en días
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Días de duración
  };

  /* // Contar la cantidad de productos en un evento
    const countProductsInEvent = (eventId) => {
        return productsInEvents.filter((product) => product.attributes.evento.id === eventId).length;
    };
 */

  const countProductsInEvent = (eventId) => {
    const products = productsInEvents[eventId]; // Obtener los productos del evento
    return products ? products.length : 0; // Si existen productos, contar; si no, retornar 0
};

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div style={styles.gridContainer}>
        <div style={{gridColumn: "span 4", textAlign: "left", marginBottom: "20px", display: "block" }}>
          <h3 style={{ marginBottom: "10px" }}>Filtros</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {["Programado", "En curso", "Finalizado Parcialmente", "Finalizado"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "tertiary"} // Cambia color
                onClick={() => setSelectedFilter(filter)} // Cambia estado
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {events.map((event) => (
          <div 
            key={event.id} 
            style={styles.card}
            onClick={
              () => {
                setEventStatus(event.attributes.estatus);
                setSelectedEvent(event);
                setSelectedProductsInEvents(productsInEvents[event.id]);
              }
          } 
          >
            <h2 style={styles.cardTitle}>{event.attributes.nombre}</h2>
            <p style={styles.cardContent}>
              <strong>Duración:</strong>{" "}
              {calculateDuration(event.attributes.fechaInicio, event.attributes.fechaFin)} días
            </p>
            <p style={styles.cardContent}>
              <strong>Equipos:</strong> {countProductsInEvent(event.id)}
            </p>
            <div style={styles.buttonContainer}>
                <button 
                    onClick={
                        () => {
                            setEventStatus(event.attributes.estatus);
                            setSelectedEvent(event);
                            setSelectedProductsInEvents(productsInEvents[event.id]);
                        }
                    } 
                    style={styles.actionButton}
                >Ver más</button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            style={{
              ...styles.paginationButton,
              backgroundColor: currentPage === i + 1 ? "#2825be" : "#4945ff",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default EventList;