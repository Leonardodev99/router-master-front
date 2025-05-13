import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileScreen.css";
import { FaEnvelope, FaUserEdit, FaSave, FaTimes, FaPhone, FaCamera } from 'react-icons/fa';

// Dados iniciais
const initialUser = {
  name: "Leonardo Tiago",
  email: "leonardo@example.com",
  phone: "999 998 888",
  joinedDate: "01/01/2023",
  avatarUrl:  null, // Pode ser null inicialmente
};

function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const [avatarFile, setAvatarFile] = useState(null); // O objeto File selecionado
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState(user.avatarUrl || null); // URL exibida (blob ou http)

  const fileInputRef = useRef(null); // Referência para o input de arquivo

  // Efeito para gerenciar a limpeza de blob URLs
  useEffect(() => {
    // Esta função de cleanup será chamada ANTES da próxima execução do effect,
    // ou quando o componente for desmontado.
    // Ela opera sobre o valor de 'avatarDisplayUrl' da renderização *anterior*.
    let previousUrl = avatarDisplayUrl;
    return () => {
      if (previousUrl && previousUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl);
        // console.log("Revoked Blob URL (on cleanup):", previousUrl);
      }
    };
  }, [avatarDisplayUrl]); // Re-executa quando avatarDisplayUrl muda

  // Sincroniza formData e avatarDisplayUrl quando 'user' muda ou 'isEditing' alterna
  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      setAvatarDisplayUrl(user.avatarUrl || null); // Mostra avatar atual ao entrar em edição
      setAvatarFile(null); // Reseta qualquer arquivo selecionado anteriormente
    } else {
      setAvatarDisplayUrl(user.avatarUrl || null);
    }
  }, [isEditing, user]);


  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); // Armazena o objeto File
      // O useEffect anterior limpará o avatarDisplayUrl antigo se for um blob.
      setAvatarDisplayUrl(URL.createObjectURL(file)); // Cria e define a nova URL de preview
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // A lógica de reset/setup é tratada pelo useEffect [isEditing, user]
  };

  const handleSave = (e) => {
    e.preventDefault();
    let finalAvatarUrl = user.avatarUrl; // Por padrão, mantém a URL existente

    if (avatarFile) {
      finalAvatarUrl = avatarDisplayUrl;
      console.log("Simulação: Avatar 'salvo' com URL temporária:", finalAvatarUrl);
    }

    const updatedUser = {
      ...formData, // name, email, phone
      avatarUrl: finalAvatarUrl,
      joinedDate: user.joinedDate, // Manter data de cadastro original
    };

    setUser(updatedUser);
    setIsEditing(false);
    setAvatarFile(null); // Limpa o estado do arquivo
  };

  // Lógica de exibição do Avatar
  const renderAvatarContent = () => {
    const url = isEditing ? avatarDisplayUrl : user.avatarUrl;
    const nameForInitials = isEditing ? formData.name : user.name;

    if (url) {
      return <img src={url} alt="Avatar" />;
    }
    return <span className="profile-avatar-placeholder">{getInitials(nameForInitials)}</span>;
  };

  return (
    <div className="profile-screen">

      <div className="profile-content">
        <div className="profile-avatar-container">
          <label htmlFor="avatarUpload" className={`profile-avatar ${isEditing ? 'editing' : ''}`}>
            {renderAvatarContent()}
            {isEditing && (
              <div className="profile-avatar-edit-overlay">
                <FaCamera />
                <span>Alterar foto</span>
              </div>
            )}
          </label>
          {isEditing && (
            <input
              type="file"
              id="avatarUpload"
              name="avatarUpload"
              accept="image/*" // Aceita qualquer tipo de imagem
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden-file-input" // Para esconder o input padrão
            />
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-form">
            <div>
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="email">E-mail:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="phone">Telefone:</label>
              <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
            </div>
            <div className="profile-actions">
              <button type="submit" className="save-button"><FaSave /> Salvar</button>
              <button type="button" onClick={handleEditToggle} className="cancel-button"><FaTimes /> Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p><FaEnvelope className="info-icon" /><strong>E-mail:</strong> {user.email}</p>
            <p><FaPhone className="info-icon" /><strong>Telefone:</strong> {user.phone || 'Não informado'}</p>
            {/* <p><FaCalendarAlt className="info-icon" /><strong>Cadastro:</strong> {user.joinedDate}</p> */}
            <div className="profile-actions">
              <button onClick={handleEditToggle} className="edit-button"><FaUserEdit /> Editar Perfil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileScreen;