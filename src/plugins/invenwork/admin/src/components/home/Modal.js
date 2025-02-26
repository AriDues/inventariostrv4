import React from "react";
import styles from "../../styles/Modal.module.css";
import { Information, ExclamationMarkCircle } from '@strapi/icons';

const Modal = ({ onClose, children }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
        {/* Botón de cierre adicional */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;

