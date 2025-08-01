import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Box,
  IconButton
} from '@strapi/design-system';
import { Search } from '@strapi/icons';
import styles from '../../styles/ProductList.module.css';

const GetProductList = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productosPorPagina = 20;

  const [usarFiltroCategoria, setUsarFiltroCategoria] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch inicial cuando cambian paginaActual, filtros o búsqueda
  useEffect(() => {
    fetchProducts();
    fetchCategorias();
  }, [paginaActual, usarFiltroCategoria, categoriaSeleccionada]);

  const fetchCategorias = async () => {
    const response = await fetch('/api/categorias');
    const dataCategorias = await response.json();
    setCategorias(dataCategorias.data);
  };

  const handleFiltroCategoria = (e) => {
    const categoria = e.target.value;
    setCategoriaSeleccionada(categoria);
    setUsarFiltroCategoria(true);
    setPaginaActual(1);
  };

  const handlePaginaChange = (page) => {
    setPaginaActual(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setUsarFiltroCategoria(false);
      setPaginaActual(1);
      fetchProducts();
    }
  };

  const fetchProducts = async () => {
    // Construir URL dinámica según filtros
    let url = `/api/productos?pagination[page]=${paginaActual}&pagination[pageSize]=${productosPorPagina}&populate=categoria`;

    if (usarFiltroCategoria && categoriaSeleccionada) {
      url += `&filters[categoria][Nombre][$eq]=${categoriaSeleccionada}`;
    }

    if (!usarFiltroCategoria && searchQuery.trim() !== '') {
      url = `/api/productos?filters[Nombre][$contains]=${searchQuery}&pagination[page]=${paginaActual}&pagination[pageSize]=${productosPorPagina}&populate=categoria`;
    }

    const response = await fetch(url);
    const dataProductos = await response.json();

    const productosConStock = await Promise.all(
      dataProductos.data.map(async (producto) => {
        const responseStock = await fetch(
          `/api/stock-almacens?filters[productos][id][$eq]=${producto.id}`
        );
        const dataStock = await responseStock.json();

        if (dataStock.data.length > 0) {
          const stockInicialPorProducto =
            dataStock?.data[0]?.attributes?.cantidad_Inicial;
          const stockPorProducto = dataStock?.data[0]?.attributes?.cantidad;

          return {
            ...producto,
            cantidad_Inicial: stockInicialPorProducto,
            cantidad: stockPorProducto,
          };
        } else {
          return {
            ...producto,
            cantidad_Inicial: 0,
            cantidad: 0,
          };
        }
      })
    );

    setProductos(productosConStock);
    setTotalPages(dataProductos.meta.pagination.pageCount);
  };

  return (
    <Box className={styles.container}>
      <Grid>
        <GridItem col={3}>
          <TextInput
            label="Buscador de equipos"
            placeholder="Buscar equipo..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            endAction={
              <IconButton
                onClick={() => {
                  setUsarFiltroCategoria(false);
                  setPaginaActual(1);
                  fetchProducts();
                }}
                icon={<Search />}
                label="Buscar equipo"
              />
            }
          />
        </GridItem>
        <GridItem col={4} className={styles.selectContainer}>
          <div>
            <label htmlFor="categoria" className={styles.label}>
              Filtrar por categoría
            </label>
            <select
              id="categoria"
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
        </GridItem>
      </Grid>

      {/* Tabla de productos */}
      <Table>
        <Thead>
          <Tr>
            <Th>SKU</Th>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Stock Inicial</Th>
            <Th>Stock</Th>
            <Th>Categoría</Th>
          </Tr>
        </Thead>
        <Tbody>
          {productos.map((producto) => (
            <Tr key={producto.id}>
              <Td>{producto.attributes.Sku}</Td>
              <Td>{producto.attributes.Nombre}</Td>
              <Td>{producto.attributes.Descripcion}</Td>
              <Td>{producto.cantidad_Inicial}</Td>
              <Td>{producto.cantidad}</Td>
              <Td>
                {producto.attributes.categoria.data?.attributes.Nombre}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Paginación */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px',
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePaginaChange(i + 1)}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor:
                paginaActual === i + 1 ? '#2825be' : '#4945ff',
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
