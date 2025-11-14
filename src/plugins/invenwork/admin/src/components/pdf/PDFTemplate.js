import logo from '/images/photo1763086493.jpg';
import React from 'react';
import '../../styles/PDFTemplate.css';

const PDFTemplate = ({ data, eventStatus, firstPageMaxItems }) => { 
  const nameStatus = {
    finish: "Finalizado",
    finishParcial: "Finalizado Parcialmente"
  };

  const { evento, productos } = data || {};
  const currentDate = new Date().toLocaleString();

  // Orden alfanumérico (A-Z, 0-9)
  const sortAlphanumeric = (a, b) => {
    const aStr = String(a ?? '').toLowerCase();
    const bStr = String(b ?? '').toLowerCase();
    const regex = /(\d+|\D+)/g;
    const aParts = aStr.match(regex) || [];
    const bParts = bStr.match(regex) || [];
    const maxLength = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || '';
      const bPart = bParts[i] || '';
      if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
        const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
        if (diff !== 0) return diff;
      } else {
        if (aPart < bPart) return -1;
        if (aPart > bPart) return 1;
      }
    }
    return 0;
  };

  // 2. Ordenar productos
  const productosOrdenados = [...(productos || [])].sort((a, b) => {
    const nameA = a?.attributes?.Nombre || '';
    const nameB = b?.attributes?.Nombre || '';
    return sortAlphanumeric(nameA, nameB);
  });

  // 3. Agrupar productos por categoría
  const productosPorCategoria = {};
  productosOrdenados.forEach(producto => {
    const categoria = producto?.categoria || 'Sin categoría';
    if (!productosPorCategoria[categoria]) {
      productosPorCategoria[categoria] = [];
    }
    productosPorCategoria[categoria].push(producto);
  });

  // 4. Ordenar categorías
  const categoriasOrdenadas = Object.keys(productosPorCategoria).sort((a, b) => 
    sortAlphanumeric(a, b)
  );

  // 5. Crear páginas
  // - Reducimos ítems de la primera página (configurable vía prop firstPageMaxItems)
  // - Páginas siguientes usan 26 ítems
  const firstPageSize = Number.isFinite(firstPageMaxItems) ? Math.max(1, firstPageMaxItems) : 10; 
  const nextPageSize = 26;  

  const paginasPorCategoria = [];
  categoriasOrdenadas.forEach(categoria => {
    const productosCategoria = productosPorCategoria[categoria] || [];
    let start = 0;
    const isFirstCategory = categoria === categoriasOrdenadas[0];
    const currentPageSize = isFirstCategory ? firstPageSize : nextPageSize;

    // Primera página de la categoría
    paginasPorCategoria.push({
      categoria,
      productos: productosCategoria.slice(start, currentPageSize),
      isFirstPage: isFirstCategory,
      isFirstPageOfCategory: true
    });

    start = currentPageSize;

    // Páginas siguientes de la misma categoría
    while (start < productosCategoria.length) {
      paginasPorCategoria.push({
        categoria,
        productos: productosCategoria.slice(start, start + nextPageSize),
        isFirstPage: false,
        isFirstPageOfCategory: false
      });
      start += nextPageSize;
    }
  });

  const totalPages = paginasPorCategoria.length;

  return (
    <div id="pdf-content" className="pdf-template">
      {paginasPorCategoria.map((pagina, pageIndex) => (
        <div key={pageIndex} className={`pdf-page ${pageIndex === 0 ? 'first-page' : ''} ${pageIndex > 0 ? 'page-break' : ''}`}>
          {/* Header solo en la primera página */}
          {pagina.isFirstPage && (
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
                <p><strong>Total de equipos:</strong> {productosOrdenados.length}</p>
              </div>
            </>
          )}

          {/* Título de categoría */}
          <h2 className="subtitle">
            {pagina.isFirstPageOfCategory 
              ? `Categoría: ${pagina.categoria}` 
              : `${pagina.categoria} (continuación)`}
          </h2>

          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Equipo</th>
                <th>Descripción</th>
                <th>Cantidad solicitada</th>
                {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && (
                  <th>Cantidad devuelta</th>
                )}
                {(eventStatus === nameStatus.finishParcial) && (
                  <th>Cantidad faltante</th>
                )}
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {pagina.productos.map((producto) => (
                <tr key={producto?.id}>
                  <td>{producto?.attributes?.Sku}</td>
                  <td>{producto?.attributes?.Nombre}</td>
                  <td className="descripcion-cell">
                    {producto?.descripcion || producto?.attributes?.Descripcion || "Sin descripción"}
                  </td>
                  <td>{producto?.quantity}</td>
                  {(eventStatus === nameStatus.finish || eventStatus === nameStatus.finishParcial) && (
                    <td>{producto?.cantidad_retornada ?? "-"}</td>
                  )}
                  {(eventStatus === nameStatus.finishParcial) && (
                    <td>{producto?.cantidad_faltante ?? "-"}</td>
                  )}
                  <td>{producto?.categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer en todas las páginas */}
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

          {/* Número de página */}
          <p className="page-number">{pageIndex + 1} de {totalPages}</p>
        </div>
      ))}
    </div>
  );
};

export default PDFTemplate;