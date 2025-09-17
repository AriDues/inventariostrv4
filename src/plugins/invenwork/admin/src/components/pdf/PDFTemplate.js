import logo from '../../assets/logo.png';
import React from 'react';
import '../../styles/PDFTemplate.css';

const truncate = (text, max = 15) =>
  !text ? '' : text.length > max ? text.slice(0, max) + '…' : text;

const PDFTemplate = ({ data, eventStatus }) => {
  const nameStatus = {
    finish: "Finalizado",
    finishParcial: "Finalizado Parcialmente"
  };
  const { evento, productos } = data;
  const currentDate = new Date().toLocaleString();

  // ordenar productos
  const productosOrdenados = [...(productos || [])].sort((a, b) => {
    const catA = (a.categoria || '').toLowerCase();
    const catB = (b.categoria || '').toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;
    const nameA = (a?.attributes?.Nombre || '').toLowerCase();
    const nameB = (b?.attributes?.Nombre || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // paginar
  const gruposProductos = [];
  if (productosOrdenados.length) {
    let start = 0;
    gruposProductos.push(productosOrdenados.slice(start, 19));
    start = 19;
    while (start < productosOrdenados.length) {
      gruposProductos.push(productosOrdenados.slice(start, start + 26));
      start += 26;
    }
  }

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
                <th>Cant. solicitada</th>
                {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && <th>Devuelta</th>}
                {(eventStatus === nameStatus.finishParcial) && <th>Faltante</th>}
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {grupo.map((p) => (
                <tr key={p?.id}>
                  <td>{truncate(p?.attributes?.Sku)}</td>
                  <td>{truncate(p?.attributes?.Nombre)}</td>
                  <td>{p?.quantity}</td>
                  {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && <td>{p?.cantidad_retornada}</td>}
                  {(eventStatus === nameStatus.finishParcial) && <td>{p?.cantidad_faltante}</td>}
                  <td>{truncate(p?.categoria)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageIndex === gruposProductos.length - 1 && (
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

          <p className="page-number">{pageIndex + 1} de {gruposProductos.length}</p>
        </div>
      ))}
    </div>
  );
};

export default PDFTemplate;
