import React from "react";
import styles from "../../../styles/Modal.module.css";
import { Information, ExclamationMarkCircle } from '@strapi/icons';

const QuestionFinishEvent = ({ onClose, onConfirm }) => {
  return (
    <>
        <h2 className={styles.modalTitle}><ExclamationMarkCircle /> Confirmación</h2>
        <div className={styles.spacer}></div>
        <p >¿Deseas finalizar este evento?</p>
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={() => onClose()}>
            No
          </button>
          <button className={styles.confirm} onClick={() => onConfirm(true)}>
            Sí
          </button>
        </div>
    </>
  );
};

export default QuestionFinishEvent;