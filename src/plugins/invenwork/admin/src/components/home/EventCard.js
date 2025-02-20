import React from "react";

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
  },
};

const EventCard = ({ datosForm, handlePrintPDF, setIsCardVisible}) => {

    console.log("event card datos form ***** " + JSON.stringify(datosForm, null, 2));


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
                    <h2 style={styles.cardTitle}>Evento Creado</h2>
                    <div style={styles.cardContentContainer}>
                        {/* Columna 1: Detalles del evento */}
                        <div style={styles.column}>
                        <p style={styles.cardContent}>
                            <strong>Nombre del evento:</strong> {datosForm.evento.attributes.nombre}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Fecha de inicio:</strong> {datosForm.evento.attributes.fechaInicio}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Fecha de fin:</strong> {datosForm.evento.attributes.fechaFin}
                        </p>
                        <p style={styles.cardContent}>
                            <strong>Hora del evento:</strong> {datosForm.evento.attributes.HoraInicio}
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
                                <th style={styles.tableHeader}>Cantidad</th>
                            </tr>
                            </thead>
                            <tbody>
                            {datosForm.productos.map((producto) => (
                                <tr key={producto.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{producto.attributes.Sku}</td>
                                <td style={styles.tableCell}>{producto.attributes.Nombre}</td>
                                <td style={styles.tableCell}>{producto.quantity}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    <div style={styles.buttonContainerRow}>
                        <button onClick={handlePrintPDF} style={styles.printButtonLeft}>
                        Generar nota
                        </button>
                        <button onClick={() => setIsCardVisible(false)} style={styles.closeButtonRight}>
                        Cerrar
                        </button>
                    </div>
                </div>
            )} 
        </>
    );
};

export default EventCard;