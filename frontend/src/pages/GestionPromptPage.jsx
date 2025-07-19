// frontend/src/pages/GestionPromptPage.jsx
//import React, { useState, useEffect, useContext } from 'react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
//import AuthContext from '../context/AuthContext';

const GestionPromptPage = () => {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
   // const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promptRes, historyRes] = await Promise.all([
                apiClient.get('/admin/prompt'),
                apiClient.get('/admin/prompt/history')
            ]);
            setPrompt(promptRes.data.prompt_text);
            setHistory(historyRes.data);
        } catch (err) {
            setError('Error al cargar los datos del prompt.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            await apiClient.put('/admin/prompt', { prompt_text: prompt });
            setSuccess('¡Prompt actualizado con éxito!');
            fetchData(); // Refresca el historial
        } catch (err) {
            setError('No se pudo guardar el prompt.');
        }
    };

    return (
        <div className="admin-page-container">
            <h2>Administrar Prompt del ChatBot</h2>
            
            <div className="config-form-container">
                <h3>Editor del Prompt Activo</h3>
                <p>Modifica el texto que define la personalidad y las reglas del bot. Los cambios se aplicarán inmediatamente.</p>
                {loading ? <p>Cargando prompt...</p> : (
                    <form onSubmit={handleSave}>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows="10"
                            style={{ width: '100%', fontFamily: 'monospace' }}
                        />
                        <button type="submit" className="btn btn-success" style={{marginTop: '1rem'}}>Guardar Prompt</button>
                    </form>
                )}
                {success && <p style={{color: 'green'}}>{success}</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>

            <div className="config-form-container">
                <h3>Historial de Cambios</h3>
                <div className="table-responsive-wrapper">
                    <table>
                        <thead>
                            <tr><th>Fecha y Hora</th><th>Modificado Por</th><th>Prompt</th></tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td>{new Date(item.timestamp).toLocaleString('es-CR')}</td>
                                    <td>{item.modificado_por}</td>
                                    <td style={{whiteSpace: 'pre-wrap', maxWidth: '400px'}}>{item.prompt_text}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Link to="/admin/panel" className="admin-menu-action admin-return-button">
                Volver al Panel de Administrador
            </Link>
        </div>
    );
};

export default GestionPromptPage;