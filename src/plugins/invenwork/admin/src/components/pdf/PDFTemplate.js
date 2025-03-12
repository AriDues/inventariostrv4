// components/PDFTemplate/PDFTemplate.js
import React from 'react';
import '../../styles/PDFTemplate.css';

const PDFTemplate = ({ data, eventStatus}) => {
    const nameStatus = {
        finish : "Finalizado" ,
        finishParcial : "Finalizado Parcialmente"
    }
    const { evento, productos } = data;
    const currentDate = new Date().toLocaleString();

    return (
        <div id="pdf-content" className="pdf-template">
        {/* Header */}
        <div className="header">
            <h2>
                {eventStatus === nameStatus.finish                    // Si está completamente finalizado
                ? "Orden de Retorno"                                // Mostrar retorno completo
                : eventStatus === nameStatus.finishParcial          // Si no, verificar si es parcial
                ? "Orden de Retorno Parcial"                      // Mostrar retorno parcial
                : "Orden de Salida"                              // Default: orden de salida
                } 
            </h2>
            <p className="current-date">{currentDate}</p>
        </div>

        {/* Información del evento */}
        <div className="event-info">
            <h1 className="title">{evento?.attributes?.nombre}</h1>
            <div className="details-grid">
            <p><strong>Locación:</strong> {evento?.attributes?.locacion}</p>
            <p><strong>Estatus:</strong> {evento?.attributes?.estatus}</p>
            <p><strong>Fecha inicio:</strong> {evento?.attributes?.fechaInicio}</p>
            <p><strong>Fecha fin:</strong> {evento?.attributes?.fechaFin}</p>
            <p><strong>Hora inicio:</strong> {evento?.attributes?.HoraInicio}</p>
            <p><strong>Hora fin:</strong> {evento?.attributes?.HoraFin}</p>
            </div>
        </div>

        {/* Listado de productos */}
        <h2 className="subtitle">Productos del evento:</h2>
        <table className="table">
            <thead>
            <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Cantidad solicitada</th>
                {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && <th>Cantidad devuelta</th>}
                {(eventStatus === nameStatus.finishParcial) && <th>Cantidad faltante</th>}
                <th>Categoria</th>
            </tr>
            </thead>
            <tbody>
            {productos?.map((producto) => (
                <tr key={producto?.id}>
                <td>{producto?.attributes?.Sku}</td>
                <td>{producto?.attributes?.Nombre}</td>
                <td>{producto?.quantity}</td>
                {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && <td>{producto?.cantidad_retornada}</td>}
                {(eventStatus === nameStatus.finishParcial) && <td>{producto?.cantidad_faltante}</td>}
                <td>{producto?.categoria}</td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Footer */}
        <div className="footer">
            <div className="signatures">
            <div className="signature-box">
                <p>Firma del encargado: _________________________</p>
            </div>
            <div className="signature-box">
                <p>Firma del receptor: _________________________</p>
            </div>
            </div>
            <p className="generated-info">Información generada desde sistema</p>
        </div>
        </div>
    );
};

export default PDFTemplate;