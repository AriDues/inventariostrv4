import React from 'react';
import '../../styles/PDFTemplate.css';

const PDFTemplate = ({ data, eventStatus }) => {
  const nameStatus = {
    finish: "Finalizado",
    finishParcial: "Finalizado Parcialmente"
  };

  const { evento, productos } = data;
  const currentDate = new Date().toLocaleString();

  const gruposProductos = [];
  if (productos && productos.length) {
    let start = 0;
    let firstPageSize = 19;
    let nextPageSize = 26;

    gruposProductos.push(productos.slice(start, firstPageSize));
    start = firstPageSize;

    while (start < productos.length) {
      gruposProductos.push(productos.slice(start, start + nextPageSize));
      start += nextPageSize;
    }
  }

  const totalPages = gruposProductos.length;

  return (
    <div id="pdf-content" className="pdf-template">
      {gruposProductos.map((grupo, pageIndex) => (
        <div key={pageIndex} className="pdf-page">
          {pageIndex === 0 && (
            <>
              <div className="header">
                <h2>
                  {eventStatus === nameStatus.finish
                    ? "Orden de Retorno"
                    : eventStatus === nameStatus.finishParcial
                      ? "Orden de Retorno Parcial"
                      : "Orden de Salida"}
                </h2>
                <p className="current-date">{currentDate}</p>
              </div>

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
                <p><strong>Total de productos:</strong> {productos.length}</p>
              </div>

              <h2 className="subtitle">Productos del evento:</h2>
            </>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Cantidad solicitada</th>
                {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && <th>Cantidad devuelta</th>}
                {(eventStatus === nameStatus.finishParcial) && <th>Cantidad faltante</th>}
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {grupo.map((producto) => (
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

          {/* Footer solo en la última página */}
          {pageIndex === totalPages - 1 && (
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
          )}

          {/* Número de página */}
          <p className="page-number">{pageIndex + 1} de {totalPages}</p>
        </div>
      ))}
    </div>
  );
};

export default PDFTemplate;
