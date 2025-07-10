// frontend/src/components/EditableUserDataForm.jsx
import React, { useState } from 'react';

const EditableUserDataForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí se podrían añadir validaciones más complejas
        if (!formData.email || !formData.telefono || !formData.direccion) {
            alert("Todos los campos son obligatorios.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="bot-message" style={{ alignSelf: 'stretch', maxWidth: '100%' }}>
            <form onSubmit={handleSubmit} className="embedded-form">
                <p>Por favor, corrige tus datos y guarda los cambios.</p>
                <label>
                    Correo electrónico:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>
                    Teléfono:
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </label>
                <label>
                    Dirección:
                    <textarea name="direccion" value={formData.direccion} onChange={handleChange} required rows="3"></textarea>
                </label>
                <div className="embedded-form-actions">
                    <button type="submit" className="btn btn-success">Guardar Cambios</button>
                    <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default EditableUserDataForm;