import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // ✅ Importa o axios configurado
import "../styles/ProfileScreen.css";
import { FaEnvelope, FaUserEdit, FaSave, FaTimes, FaPhone, FaCamera } from 'react-icons/fa';

function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', photos: '' });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/profile"); // ✅ token enviado automaticamente
        const userData = response.data;
        setUser({
          name: userData.username,
          email: userData.email,
          phone: userData.phone,
          avatarUrl: userData.photos?.url || null,
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        username: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      setAvatarDisplayUrl(user.avatarUrl || null);
    }
  }, [isEditing, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarDisplayUrl(URL.createObjectURL(file));
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      const data = new FormData();
  
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
  
      if (avatarFile) {
        data.append("photo", avatarFile); // 👈 nome do campo deve bater com o que o backend espera
      }
  
      const response = await api.put(`/users/${user.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      setUser({
        name: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        avatarUrl: response.data.photos?.url || avatarDisplayUrl, // ✅ atualiza com a nova URL
      });
  
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };
  

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names[0][0] + (names[1]?.[0] || "");
  };

  const renderAvatarContent = () => {
    const url = isEditing ? avatarDisplayUrl : user?.avatarUrl;
    const nameForInitials = isEditing ? formData.username : user?.name;
    return url ? <img src={url} alt="Avatar" /> : <span className="profile-avatar-placeholder">{getInitials(nameForInitials)}</span>;
  };

  if (!user) return <p>Carregando...</p>;

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
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden-file-input"
            />
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-form">
            <div>
              <label>Nome:</label>
              <input name="username" value={formData.username} onChange={handleInputChange} />
            </div>
            <div>
              <label>Email:</label>
              <input name="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div>
              <label>Telefone:</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="profile-actions">
              <button type="submit" className="save-button"><FaSave /> Salvar</button>
              <button type="button" onClick={handleEditToggle} className="cancel-button"><FaTimes /> Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p><FaEnvelope className="info-icon" /> <strong>Email:</strong> {user.email}</p>
            <p><FaPhone className="info-icon" /> <strong>Telefone:</strong> {user.phone || "Não informado"}</p>
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
