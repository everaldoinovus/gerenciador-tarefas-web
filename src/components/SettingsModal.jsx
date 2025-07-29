// Arquivo: gerenciador-tarefas-web/src/components/SettingsModal.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';

// Estilos do Modal (padding foi movido para os elementos internos)
const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '550px', border: '1px solid #ccc', borderRadius: '8px', padding: '0', overflow: 'hidden' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

function SettingsModal({ isOpen, onRequestClose, sector }) {
    const [activeTab, setActiveTab] = useState('members'); // 'members' ou 'statuses'
    
    // (A lógica para buscar membros e status será adicionada aqui)

    if (!sector) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Configurações do Setor">
            <div className="settings-modal-header">
                <h2>Configurações - {sector.nome}</h2>
                <div className="tabs">
                    <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'active' : ''}>Membros</button>
                    <button onClick={() => setActiveTab('statuses')} className={activeTab === 'statuses' ? 'active' : ''}>Colunas / Status</button>
                </div>
            </div>
            <div className="settings-modal-content">
                {activeTab === 'members' ? (
                    <div>
                        <h4>Gerenciar Membros</h4>
                        <p>(A interface para convidar e listar membros aparecerá aqui.)</p>
                    </div>
                ) : (
                    <div>
                        <h4>Gerenciar Colunas / Status</h4>
                        <p>(A interface para adicionar, renomear e deletar status aparecerá aqui.)</p>
                    </div>
                )}
            </div>
            <div className="settings-modal-footer">
                <button onClick={onRequestClose} className="close-modal-btn">Fechar</button>
            </div>
        </Modal>
    );
}

export default SettingsModal;