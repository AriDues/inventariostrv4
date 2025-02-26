import React, { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, TextInput, Typography, Grid, GridItem, Box, IconButton } from '@strapi/design-system';
import { Search } from '@strapi/icons';
import styles from '../../styles/FormProduct.module.css'; // Importar estilos CSS Modules

const FormProduct = ({ setIsFormVisible, setIsCardVisible, setDatosForm }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        sku: '',
        precio: 0,
        categoria: '',
        cantidad: 0,
      });
    
      const [busquedaCategoria, setBusquedaCategoria] = useState('');
      const [nuevaCategoria, setNuevaCategoria] = useState('');
    
      // Manejar cambios en el formulario
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    
      // Manejar búsqueda de categoría
      const handleBusquedaCategoria = (e) => {
        setBusquedaCategoria(e.target.value);
      };
    
      // Manejar creación de nueva categoría
      const handleCrearCategoria = () => {
        if (nuevaCategoria) {
          alert(`Categoría "${nuevaCategoria}" creada exitosamente`);
          setNuevaCategoria('');
        }
      };

    return ( 
        <>
            <div className={styles.container}>
                <Typography variant="beta" >
                    Crear Producto
                </Typography>
                <div className={styles.grid}>
                    {/* Columna 1: Formulario de Producto */}
                    <div className={styles.columna}>
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <TextInput label="Nombre del producto" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>

                        <div className={styles.formGroup}>                            
                            <TextInput label="Descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <TextInput label="Sku" name="sku" value={formData.sku} onChange={handleChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <TextInput label="Precio" name="precio" type="number" value={formData.precio} onChange={handleChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <TextInput label="Stock inicial" name="cantidad" type="number" value={formData.precio} onChange={handleChange} required />
                        </div>

                        <button type="submit" className={styles.botonEnviar}>
                            Crear Producto
                        </button>
                    </form>
                    </div>

                    {/* Columna 2: Búsqueda y Creación de Categoría */}
                    <div className={styles.columna}>
                    
                        <div className={styles.crearCategoria}>
                            <Typography variant="beta" >
                                Crear categoria
                            </Typography>
                            <input
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                            className={styles.inputNuevaCategoria}
                            />
                            <button
                            onClick={handleCrearCategoria}
                            className={styles.botonCrearCategoria}
                            >
                            Crear Categoría
                            </button>
                        </div>

                        <div className={styles.crearCategoria}>
                        <Typography variant="beta" >
                            Categorias
                        </Typography>
                            <input
                            type="text"
                            placeholder="Buscar categoría"
                            value={busquedaCategoria}
                            onChange={handleBusquedaCategoria}
                            className={styles.inputBusqueda}
                            />
                            <button className={styles.botonBuscar}>Buscar</button>
                        </div>
                    </div>
                </div>
            </div>        
        </>

    );
};



export default FormProduct;