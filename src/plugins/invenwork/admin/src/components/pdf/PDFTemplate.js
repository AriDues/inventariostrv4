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

  // 🔹 1. Función para ordenar alfanuméricamente (A-Z, 0-9)
  const sortAlphanumeric = (a, b) => {
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    
    // Separar números y letras para ordenamiento natural
    const regex = /(\d+|\D+)/g;
    const aParts = aStr.match(regex) || [];
    const bParts = bStr.match(regex) || [];
    
    const maxLength = Math.max(aParts.length, bParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || '';
      const bPart = bParts[i] || '';
      
      // Si ambas partes son números, comparar numéricamente
      if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
        const diff = parseInt(aPart) - parseInt(bPart);
        if (diff !== 0) return diff;
      } else {
        // Comparar alfabéticamente
        if (aPart < bPart) return -1;
        if (aPart > bPart) return 1;
      }
    }
    
    return 0;
  };

  // 🔹 2. Ordenar productos por nombre usando ordenamiento alfanumérico
  const productosOrdenados = [...(productos || [])].sort((a, b) => {
    const nameA = a.attributes?.Nombre || '';
    const nameB = b.attributes?.Nombre || '';
    return sortAlphanumeric(nameA, nameB);
  });

  // 🔹 3. Agrupar productos por categoría manteniendo el orden
  const productosPorCategoria = {};
  productosOrdenados.forEach(producto => {
    const categoria = producto.categoria || 'Sin categoría';
    if (!productosPorCategoria[categoria]) {
      productosPorCategoria[categoria] = [];
    }
    productosPorCategoria[categoria].push(producto);
  });

  // 🔹 4. Ordenar las categorías alfabéticamente
  const categoriasOrdenadas = Object.keys(productosPorCategoria).sort((a, b) => 
    sortAlphanumeric(a, b)
  );

  // 🔹 5. Crear páginas - una página por categoría
  const paginasPorCategoria = [];
  categoriasOrdenadas.forEach(categoria => {
    const productosCategoria = productosPorCategoria[categoria];
    
    // Dividir productos de la categoría en páginas si es necesario
    let start = 0;
    let firstPageSize = 19; // Primera página con header
    let nextPageSize = 26;  // Páginas siguientes sin header
    
    // Primera página de la categoría (con header si es la primera categoría general)
    const isFirstCategory = categoria === categoriasOrdenadas[0];
    const currentPageSize = isFirstCategory ? firstPageSize : nextPageSize;
    
    paginasPorCategoria.push({
      categoria,
      productos: productosCategoria.slice(start, currentPageSize),
      isFirstPage: isFirstCategory,
      isFirstPageOfCategory: true
    });
    start = currentPageSize;
    
    // Páginas adicionales de la categoría si es necesario
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
        <div key={pageIndex} className={`pdf-page ${pageIndex > 0 ? 'page-break' : ''}`}>
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
                <p><strong>Total de productos:</strong> {productosOrdenados.length}</p>
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
      <th>Producto</th>
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