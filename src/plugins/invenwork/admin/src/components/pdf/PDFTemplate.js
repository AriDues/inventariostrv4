import logo from '../../assets/logo.png';
import React from 'react';
import '../../styles/PDFTemplate.css';

const PDFTemplate = ({ data, eventStatus }) => {
  const nameStatus = {
    finish: "Finalizado",
    finishParcial: "Finalizado Parcialmente"
  };

  const { evento, productos } = data;
  const currentDate = new Date().toLocaleString();

  // 🔹 1. Ordenar productos por categoría y luego por nombre
  const productosOrdenados = [...(productos || [])].sort((a, b) => {
    const catA = (a.categoria || '').toLowerCase();
    const catB = (b.categoria || '').toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;

    const nameA = (a?.attributes?.Nombre || '').toLowerCase();
    const nameB = (b?.attributes?.Nombre || '').toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  // 🔹 2. Agrupar productos ordenados en páginas
  const gruposProductos = [];
  if (productosOrdenados.length) {
    let start = 0;
    let firstPageSize = 19;
    let nextPageSize = 26;

    gruposProductos.push(productosOrdenados.slice(start, firstPageSize));
    start = firstPageSize;

    while (start < productosOrdenados.length) {
      gruposProductos.push(productosOrdenados.slice(start, start + nextPageSize));
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
                <img src={logo} alt="Logo" className="pdf-logo" />
                <div style={{ textAlign: 'right' }}>
                  <h2>
                    {eventStatus === nameStatus.finish
                      ? "Orden de Retorno"
                      : eventStatus === nameStatus.finishParcial
                        ? "Orden de Retorno Parcial"
                        : "Orden de Salida"}
                  </h2>
                  <p className="current-date">{currentDate}</p>
                </div>
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
                <p><strong>Total de productos:</strong> {productosOrdenados.length}</p>
              </div>

              <h2 className="subtitle">Equipos del evento:</h2>
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
