// frontend/src/pages/PreguntasSinResponderPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const PreguntasSinResponderPage = () => {
    const [pendingFaqs, setPendingFaqs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [respuesta, setRespuesta] = useState('');
    
    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const response = await apiClient.get('/admin/faq/pending');
        setPendingFaqs(response.data);
    };

    const handleAnswer = async (faqId) => {
        await apiClient.put(`/admin/faq/${faqId}/answer?respuesta=${encodeURIComponent(respuesta)}`);
        setEditingId(null);
        setRespuesta('');
        fetchData();
    };

    const handleDelete = async (faqId) => {
        if (window.confirm('¿Seguro que quieres eliminar esta pregunta?')) {
            await apiClient.delete(`/admin/faq/${faqId}`);
            fetchData();
        }
    };

    return (
        <div className="admin-page-container">
            <h2>Preguntas sin Responder</h2>
            <div className="table-responsive-wrapper">
                <table>
                    <thead><tr><th>Pregunta del Usuario</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {pendingFaqs.map(faq => (
                            <tr key={faq.id}>
                                <td>
                                    <p><em>{faq.pregunta}</em></p>
                                    {editingId === faq.id && (
                                        <div>
                                            <textarea 
                                                value={respuesta}
                                                onChange={(e) => setRespuesta(e.target.value)}
                                                rows="3"
                                                style={{width: '90%', marginTop: '0.5rem'}}
                                                placeholder="Escribe aquí la respuesta para añadirla a la base de conocimiento..."
                                            />
                                            <button onClick={() => handleAnswer(faq.id)} className="btn btn-success btn-sm" style={{display: 'block', marginTop: '0.5rem'}}>Guardar Respuesta</button>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {editingId !== faq.id ? (
                                        <button onClick={() => { setEditingId(faq.id); setRespuesta(''); }} className="btn btn-primary btn-sm">Responder</button>
                                    ) : (
                                        <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">Cancelar</button>
                                    )}
                                    <button onClick={() => handleDelete(faq.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Link to="/admin/panel" className="admin-menu-action admin-return-button">Volver al Panel de Administrador</Link>
        </div>
    );
};

export default PreguntasSinResponderPage;