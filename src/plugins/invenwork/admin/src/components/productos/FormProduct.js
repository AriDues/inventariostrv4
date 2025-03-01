import React, { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, TextInput, Typography, Grid, GridItem, Box, IconButton } from '@strapi/design-system';
import { toast } from 'react-toastify';
import { Search, Plus } from '@strapi/icons';
import styles from '../../styles/FormProduct.module.css'; // Importar estilos CSS Modules

//generador de SKU
function generarSKU(nombre, categoria) {

    console.log(nombre + " " + categoria)
    // 1. Tomar las primeras 3 letras del nombre y convertirlas a mayúsculas
    const abreviacionNombre = nombre.slice(0, 3).toUpperCase();
  
    // 2. Tomar las primeras 3 letras de la categoría y convertirlas a mayúsculas
    const abreviacionCategoria = categoria.slice(0, 3).toUpperCase();
  
    // 3. Generar un código único corto (usamos los últimos 4 dígitos del timestamp)
    const codigoUnico = Date.now().toString().slice(-4);

    console.log(codigoUnico)
  
    // 4. Combinar todo para formar el SKU
    const sku = `${abreviacionNombre}-${abreviacionCategoria}-${codigoUnico}`;

    console.log(sku)
  
    return sku;
}

const FormProduct = ({setIsFormVisible}) => {
        const [formData, setFormData] = useState({
            nombre: '',
            descripcion: '',
            sku: '',
            idCategoria: 0,
            categoria: '',
            precio: 0,
            cantidad: 0,
            cantidad_inicial: 0,
        });
        const [searchQuery, setSearchQuery] = useState('');
        const [searchResults, setSearchResults] = useState([]);
        const [newCategoria, setNewCategoria] = useState(false);
        const [hoveredItem, setHoveredItem] = useState(null);

        useEffect(() => {
          if(searchQuery.trim() === ""){
            setNewCategoria(false);
          }
        }, [searchQuery])
        
        // Manejar cambios en el formulario
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };
        
        // Manejar búsqueda de categoría
        const handleBusquedaCategoria = (e) => {
            setSearchQuery(e.target.value);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                fetchCategoria();
            }
          };
        
        const fetchCategoria = async () => {
            try {
                if (searchQuery.trim() === ''){
                    return setSearchResults([]);
                }

                const categoriasResponse = await fetch(`/api/categorias?filters[Nombre][$contains]=${searchQuery}`);
                const categoriasData = await categoriasResponse.json();
                
                if(categoriasData.data.length === 0 ){
                    setSearchResults([]); 
                    setNewCategoria(true);           
                    return toast.error('Categoria no encontrada');   
                }

                setSearchResults(categoriasData.data);                
               
            } catch (error) {
                console.error('Error fetching products:', error);
            }        
        };

        const addCategoria = (idCategoria, categoria) => {
            formData.idCategoria = idCategoria;
            formData.categoria = categoria;
            setSearchQuery('');
            setSearchResults([]);
        };

        // Manejar creación de nueva categoría
        const handleCrearCategoria = async () => {
            if (searchQuery.trim() === ''){
                return setSearchResults([]);
            }

            try {
                
                const obj = {
                    Nombre : searchQuery.toLowerCase(),
                }

                // 1️⃣ Enviar solicitud para crear el evento
                const categoriaResponse = await fetch('/api/categorias', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: obj
                    })
                });

                if (!categoriaResponse.ok) {
                    return toast.error('Error al crear la categoria');
                }   
                
                toast.success('Categoria creada correctamente');

                const categoriaData = await categoriaResponse.json();
                formData.idCategoria = categoriaData.data.id;
                formData.categoria = categoriaData.data.attributes.Nombre;
                setSearchQuery('');
                setSearchResults([]);
                setNewCategoria(false);
                 
            } catch (error) {
                console.error('Error en handleCrearCategoria:', error);
            }
        };

        const handleFieldSku = async () =>{
            if(formData.nombre.trim() === '' || formData.categoria.trim() === ''){
                return toast.error('Ingrese Nombre del equipo y Categoria para generar SKU'); 
            }

            const skuCod = generarSKU(formData.nombre, formData.categoria);
            setFormData({ ...formData, sku: skuCod })
        }

        const handleSubmit = async (e) =>{
            e.preventDefault();

            const obj = {
                Nombre: formData.nombre,
                Descripcion: formData.descripcion,
                Sku: formData.sku,
                Precio: formData.precio,
                categoria: formData.idCategoria,
            }

            try {
                // 1️⃣ Enviar solicitud
                const productoResponse = await fetch('/api/productos', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: obj
                    })
                });

                if (!productoResponse.ok) {
                    return toast.error('Error al crear el equipo');
                  }
          
                const productoData = await productoResponse.json();
            
                const productoId = productoData.data.id;

                const objStock = {
                    cantidad: formData.cantidad,
                    productos: productoId,
                    almacenes: 1,
                    cantidad_Inicial: formData.cantidad,
                }

                // 1️⃣ Enviar solicitud
                const stockAlmacenResponse = await fetch('/api/stock-almacens', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: objStock
                    })
                });

                if (!stockAlmacenResponse.ok) {
                    return toast.error('Error al asignar el stock del equipo');
                }
                  
                toast.success('Equipo creado correctamente');

                setTimeout(() => {
                    setIsFormVisible(false);
                }, 2000);
                                    

            } catch (error) {
                console.error('Error en handleSubmit:', error);
            }

        }

    return (
        <>
            <div className={styles.container}>
                <Typography variant="beta" >
                    Crear Equipo
                </Typography>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Grid gap={4} columns={12}>
                    
                        {/* Columna 1: Formulario de Producto */}
                        <GridItem col={6}>                       
                            <div className={styles.formGroup}>
                                <TextInput label="Nombre del equipo" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>                            
                                <TextInput label="Descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <TextInput label="Categoria" name="categoria" value={formData.categoria} required disabled />
                            </div>
                            <div className={styles.formGroup}>
                                <TextInput label="Sku" name="sku" value={formData.sku} onChange={handleChange} className={styles.inputBusqueda} required endAction={<Button onClick={handleFieldSku} variant="default"> Generar SKU </Button> } />
                            </div>                            
                            <div className={styles.formGroup}>
                                <TextInput label="Stock" name="cantidad" type="number" value={formData.cantidad} onChange={handleChange} required />
                            </div>                            
                        </GridItem>
                        {/* Columna 2: Búsqueda y Creación de Categoría */}
                        <GridItem col={6}>
                            {/*Buscador de categoria*/}
                            <div className={styles.crearCategoria}>
                                <TextInput
                                    label="Buscador de categoria"
                                    placeholder="Buscar categoría"
                                    value={searchQuery}
                                    onChange={handleBusquedaCategoria}
                                    onKeyDown={handleKeyDown}
                                    className={styles.inputBusqueda}
                                    endAction={
                                        newCategoria ? <Button onClick={handleCrearCategoria} variant="default"> Crear Categoria </Button> : <IconButton onClick={fetchCategoria} icon={<Search />} label="Buscar" />
                                    }
                                />
                                {searchResults.length > 0 && (
                                    <Box style={styles.floatingPreview}>
                                        {searchResults.map((categoria) => (
                                            <div 
                                                key={categoria.id} 
                                                onClick={() => addCategoria(categoria.id, categoria.attributes.Nombre)} 
                                                style={{
                                                    padding: "10px",
                                                    margin: "5px",
                                                    cursor: "pointer",
                                                    backgroundColor: hoveredItem === categoria.id ? '#f0f0f0' : 'white', // Cambia el color si está en hover
                                                    transition: 'background-color 0.3s ease',
                                                }}
                                                onMouseEnter={() => setHoveredItem(categoria.id)} // Actualiza hoveredItem con el índice
                                                onMouseLeave={() => setHoveredItem(null)} // Restablece hoveredItem a null
                                            >
                                            {"ID " + categoria.id + " " + categoria.attributes.Nombre}
                                            </div>
                                        ))}
                                    </Box>
                                )}
                            </div>
                        </GridItem>
                        {/* Botón Enviar */}
                        <GridItem col={3}>
                            <Button type="submit" variant="default">
                                Crear Equipo
                            </Button>
                        </GridItem>
                    </Grid>
                </form>
            </div>        
        </>
    );
};



export default FormProduct;