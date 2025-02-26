import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Td, Th, Select, Box, Pagination } from '@strapi/design-system';
import styles from '../../styles/ProductList.module.css'; // Importar estilos CSS Modules

const GetProductList = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('sonido');
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalProductos, setTotalProductos] = useState(0);

    const productosPorPagina = 20;

    // Obtener productos y categorías
    useEffect(() => {

        // Obtener el stock de cada producto
        const fetchProductos = async () => {
            //productos?pagination[page]=1&pagination[pageSize]=20&populate=categoria&filters[categoria][Nombre][$eq]=video
            const response = await fetch(`/api/productos?pagination[page]=${paginaActual}&pagination[pageSize]=${productosPorPagina}&populate=categoria&filters[categoria][Nombre][$eq]=${filtroCategoria}`);
            const dataProductos = await response.json();

            // Obtener el stock de cada producto
            const productosConStock = await Promise.all(
                dataProductos.data.map(async (producto) => {
                const responseStock = await fetch(
                    `/api/stock-almacens?filters[productos][id][$eq]=${producto.id}`
                );
                const dataStock = await responseStock.json();
        console.log('cantidad_faltante', JSON.stringify(dataStock?.data[0]?.attributes?.cantidad, null, 2));

            
                // Verificar si hay stock para el producto
                if (dataStock.data.length > 0) {
                    // Sumar el stock de todos los almacenes para este producto
                    const stockPorProducto = dataStock?.data[0]?.attributes?.cantidad
            
                    // Agregar el stock total al objeto del producto
                    return {
                    ...producto,
                    cantidad: stockPorProducto,
                    };
                } else {
                    // Si no hay stock, devolver 0
                    return {
                    ...producto,
                    cantidad: 0,
                    };
                }
                })
            );

            setProductos(productosConStock);
            setTotalProductos(dataProductos.meta.pagination.pageCount);
        };


        const fetchCategorias = async () => {
        const response = await fetch('/api/categorias');
        const dataCategorias = await response.json();
        setCategorias(dataCategorias.data);
        };

        fetchProductos();
        fetchCategorias();
    }, [paginaActual, filtroCategoria, ]);

    // Manejar cambio de categoría
    const handleFiltroCategoria = (e) => {
        setFiltroCategoria(e.target.value);
        setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
    };

    // Manejar cambio de página
    const handlePaginaChange = (page) => {
        setPaginaActual(page);
    };

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalProductos / productosPorPagina);

  return (
    <Box className={styles.container}>

      {/* Filtro por categoría (select personalizado) */}
      <div className={styles.selectContainer}>
        <label htmlFor="categoria" className={styles.label}>
          Filtrar por categoría
        </label>
        <select
          id="categoria"
          value={filtroCategoria}
          onChange={handleFiltroCategoria}
          className={styles.select}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.attributes.Nombre}>
              {categoria.attributes.Nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de productos */}
      <Table>
        <Thead>
          <Tr>
            <Th>SKU</Th>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Stock</Th>            
            {/* <Th>Precio</Th> */}
            <Th>Categoría</Th>
          </Tr>
        </Thead>
        <Tbody>
          {productos.map((producto) => (
            <Tr key={producto.id}>
                <Td>{producto.attributes.Sku}</Td>
                <Td>{producto.attributes.Nombre}</Td>
                <Td>{producto.attributes.Descripcion}</Td>
                <Td>{producto.cantidad}</Td>              
                {/* <Td>${producto.attributes.Precio}</Td> */}
                <Td>{producto.attributes.categoria.data?.attributes.Nombre}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Paginación personalizada */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePaginaChange(i + 1)}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: paginaActual === i + 1 ? '#2825be' : '#4945ff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </Box>
  );
};

export default GetProductList;