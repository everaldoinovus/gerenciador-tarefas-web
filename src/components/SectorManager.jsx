// Arquivo: gerenciador-tarefas-web/src/components/SectorManager.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '400px', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

function SectorManager({ isOpen, onRequestClose, onSectorsUpdate }) {
  const [sectors, setSectors] = useState([]);
  const [newSectorName, setNewSectorName] = useState('');

  const fetchSectors = async () => { try { const response = await axios.get('http://localhost:3333/setores'); setSectors(response.data); } catch (error) { console.error("Erro ao buscar setores:", error); } };
  useEffect(() => { if (isOpen) { fetchSectors(); } }, [isOpen]);

  const handleAddSector = async (e) => { e.preventDefault(); if (!newSectorName.trim()) return; try { await axios.post('http://localhost:3333/setores', { nome: newSectorName }); setNewSectorName(''); fetchSectors(); onSectorsUpdate('add', newSectorName); } catch (error) { toast.error(error.response?.data?.error || "Erro ao criar setor."); } };
  const handleDeleteSector = async (sectorId) => {
    const CustomToast = ({ closeToast }) => (
      <div>
        <p>Tem certeza que deseja deletar?</p>
        <button className="toast-confirm-btn" onClick={() => { executeDelete(sectorId); closeToast(); }}>Sim</button>
        <button className="toast-cancel-btn" onClick={closeToast}>Não</button>
      </div>
    );
    const executeDelete = async (id) => { try { await axios.delete(`http://localhost:3333/setores/${id}`); fetchSectors(); onSectorsUpdate('delete'); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar setor."); } };
    toast.warn(<CustomToast />, { autoClose: false, closeOnClick: false, draggable: false });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Gerenciar Setores">
      <h2>Gerenciar Setores</h2>
      <form onSubmit={handleAddSector} className="sector-form">
        <input type="text" value={newSectorName} onChange={(e) => setNewSectorName(e.target.value)} placeholder="Nome do novo setor" />
        <button type="submit">Adicionar</button>
      </form>
      
      {/* CONDIÇÃO ADICIONADA AQUI */}
      {sectors.length === 0 ? (
        <div className="empty-state-message">
          <p>Nenhum setor cadastrado. Adicione seu primeiro setor acima.</p>
        </div>
      ) : (
        <ul className="sector-list">
          {sectors.map(sector => (
            <li key={sector.id}>
              {sector.nome}
              <button onClick={() => handleDeleteSector(sector.id)} className="delete-sector-btn">×</button>
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={onRequestClose} className="close-modal-btn">Fechar</button>
    </Modal>
  );
}

export default SectorManager;