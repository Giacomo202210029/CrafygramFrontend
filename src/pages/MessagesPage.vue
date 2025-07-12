<script setup>
import { ref, nextTick } from 'vue'

// Estados reactivos mínimos
const newMessage = ref('')
const isTyping = ref(false)
const showEmojiPicker = ref(false)
const activeChat = ref('ana-garcia')

// Mock data del creador
const creator = ref({
  id: 'ana-garcia',
  name: 'Ana García',
  category: 'Arte Digital',
  avatar: '🎨',
  isOnline: true,
  lastSeen: 'Hace 2 minutos',
  tierLevel: 'Patrón Gold'
})

// Mock data de conversaciones
const conversations = ref([
  {
    id: 'ana-garcia',
    name: 'Ana García',
    avatar: '🎨',
    lastMessage: 'Gracias por tu apoyo! 🎨',
    timestamp: '14:30',
    unread: 2,
    isOnline: true
  },
  {
    id: 'carlos-musica',
    name: 'Carlos Música',
    avatar: '🎵',
    lastMessage: 'Nueva canción disponible',
    timestamp: '12:15',
    unread: 0,
    isOnline: false
  },
  {
    id: 'tech-explica',
    name: 'Tech Explica',
    avatar: '💻',
    lastMessage: 'Tutorial de React listo',
    timestamp: '10:45',
    unread: 1,
    isOnline: true
  }
])

// Mock data de mensajes
const messages = ref([
  {
    id: 1,
    sender: 'creator',
    content: '¡Hola! Muchas gracias por convertirte en mi patrón 🎨',
    timestamp: '14:25',
    type: 'text'
  },
  {
    id: 2,
    sender: 'user',
    content: 'Me encanta tu trabajo! Espero con ansias el próximo tutorial',
    timestamp: '14:27',
    type: 'text'
  },
  {
    id: 3,
    sender: 'creator',
    content: 'Aquí tienes un adelanto exclusivo de mi próxima obra',
    timestamp: '14:28',
    type: 'text'
  },
  {
    id: 4,
    sender: 'creator',
    content: 'artwork_preview.jpg',
    timestamp: '14:28',
    type: 'image'
  },
  {
    id: 5,
    sender: 'user',
    content: '¡Increíble! Los colores son espectaculares 🤩',
    timestamp: '14:30',
    type: 'text'
  },
  {
    id: 6,
    sender: 'creator',
    content: 'Gracias por tu apoyo! Me motiva a seguir creando 💜',
    timestamp: '14:30',
    type: 'text'
  }
])

// Emojis comunes
const emojis = ['😊', '😍', '🎨', '👏', '🔥', '💜', '🙌', '✨', '🎉', '💯', '😂', '❤️']

// Función para enviar mensaje (solo estructura)
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    // Aquí agregarías la lógica de envío
    console.log('Enviando mensaje:', newMessage.value)
    newMessage.value = ''
  }
}

// Función para añadir emoji
const addEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
}
</script>

<template>
  <div class="messaging-app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">CraftyGram</div>
          <div class="nav-center">
            <h1 class="page-title">Mensajes</h1>
          </div>
          <div class="user-actions">
            <button class="btn btn-icon">🔔</button>
            <button class="btn btn-icon">👤</button>
          </div>
        </nav>
      </div>
    </header>

    <div class="messaging-container">
      <!-- Sidebar de conversaciones -->
      <aside class="conversations-sidebar">
        <div class="sidebar-header">
          <h2>Conversaciones</h2>
          <button class="btn btn-primary btn-sm">Nueva conversación</button>
        </div>

        <div class="conversations-list">
          <div
              v-for="conversation in conversations"
              :key="conversation.id"
              :class="['conversation-item', { active: activeChat === conversation.id }]"
              @click="activeChat = conversation.id"
          >
            <div class="conversation-avatar">
              <span class="avatar-emoji">{{ conversation.avatar }}</span>
              <div v-if="conversation.isOnline" class="online-indicator"></div>
            </div>

            <div class="conversation-info">
              <div class="conversation-header">
                <h3 class="conversation-name">{{ conversation.name }}</h3>
                <span class="conversation-time">{{ conversation.timestamp }}</span>
              </div>
              <p class="conversation-preview">{{ conversation.lastMessage }}</p>
            </div>

            <div v-if="conversation.unread > 0" class="unread-badge">
              {{ conversation.unread }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat principal -->
      <main class="chat-main">
        <!-- Header del chat -->
        <div class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">
              <span class="avatar-emoji">{{ creator.avatar }}</span>
              <div v-if="creator.isOnline" class="online-indicator"></div>
            </div>
            <div class="chat-user-details">
              <h3 class="chat-user-name">{{ creator.name }}</h3>
              <div class="chat-user-status">
                <span v-if="creator.isOnline" class="status-online">En línea</span>
                <span v-else class="status-offline">{{ creator.lastSeen }}</span>
                <span class="tier-badge">{{ creator.tierLevel }}</span>
              </div>
            </div>
          </div>

          <div class="chat-actions">
            <button class="btn btn-icon" title="Llamada de voz">📞</button>
            <button class="btn btn-icon" title="Videollamada">📹</button>
            <button class="btn btn-icon" title="Más opciones">⋮</button>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="messages-container">
          <div
              v-for="message in messages"
              :key="message.id"
              :class="['message', message.sender === 'user' ? 'message-sent' : 'message-received']"
          >
            <div v-if="message.sender === 'creator'" class="message-avatar">
              <span class="avatar-emoji">{{ creator.avatar }}</span>
            </div>

            <div class="message-content">
              <div v-if="message.type === 'text'" class="message-bubble">
                {{ message.content }}
              </div>

              <div v-if="message.type === 'image'" class="message-image">
                <div class="image-placeholder">
                  🖼️ {{ message.content }}
                </div>
              </div>

              <div class="message-time">{{ message.timestamp }}</div>
            </div>
          </div>

          <!-- Indicador de escritura -->
          <div v-if="isTyping" class="typing-indicator">
            <div class="message-avatar">
              <span class="avatar-emoji">{{ creator.avatar }}</span>
            </div>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="message-input-container">
          <div class="message-input-wrapper">
            <button class="btn btn-icon" title="Adjuntar archivo">📎</button>

            <div class="input-field">
              <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  class="message-input"
                  @keypress.enter="sendMessage"
              />
            </div>

            <button
                class="btn btn-icon"
                title="Emojis"
                @click="showEmojiPicker = !showEmojiPicker"
            >
              😊
            </button>

            <button
                class="btn btn-primary"
                @click="sendMessage"
                :disabled="!newMessage.trim()"
            >
              Enviar
            </button>
          </div>

          <!-- Picker de emojis -->
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div class="emoji-grid">
              <button
                  v-for="emoji in emojis"
                  :key="emoji"
                  class="emoji-btn"
                  @click="addEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Panel de información -->
      <aside class="info-panel">
        <div class="panel-header">
          <h3>Información del Creador</h3>
        </div>

        <div class="creator-profile">
          <div class="profile-avatar">
            <span class="avatar-emoji large">{{ creator.avatar }}</span>
          </div>
          <h3>{{ creator.name }}</h3>
          <p class="creator-category">{{ creator.category }}</p>
          <div class="tier-info">
            <span class="tier-badge">{{ creator.tierLevel }}</span>
          </div>
        </div>

        <div class="panel-section">
          <h4>Acciones Rápidas</h4>
          <div class="quick-actions">
            <button class="action-btn">
              <span class="action-icon">👁️</span>
              Ver Perfil
            </button>
            <button class="action-btn">
              <span class="action-icon">🎁</span>
              Enviar Propina
            </button>
            <button class="action-btn">
              <span class="action-icon">📊</span>
              Gestionar Suscripción
            </button>
            <button class="action-btn">
              <span class="action-icon">🔔</span>
              Notificaciones
            </button>
          </div>
        </div>

        <div class="panel-section">
          <h4>Archivos Compartidos</h4>
          <div class="shared-files">
            <div class="file-item">
              <span class="file-icon">🖼️</span>
              <span class="file-name">artwork_preview.jpg</span>
            </div>
            <div class="file-item">
              <span class="file-icon">📄</span>
              <span class="file-name">tutorial_digital_art.pdf</span>
            </div>
            <div class="file-item">
              <span class="file-icon">🎵</span>
              <span class="file-name">background_music.mp3</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.messaging-app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  background: #f5f5f5;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid #e0e0e0;
  font-size: 1.2rem;
  padding: 0;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Layout principal */
.messaging-container {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  height: calc(100vh - 80px);
  gap: 1px;
  background: #e0e0e0;
}

/* Sidebar de conversaciones */
.conversations-sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.conversation-item.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.conversation-avatar {
  position: relative;
  margin-right: 1rem;
}

.avatar-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 1.5rem;
}

.avatar-emoji.large {
  width: 80px;
  height: 80px;
  font-size: 2.5rem;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-size: 1rem;
  font-weight: 600;
  truncate: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.conversation-time {
  font-size: 0.8rem;
  opacity: 0.7;
}

.conversation-preview {
  font-size: 0.9rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Chat principal */
.chat-main {
  background: white;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-avatar {
  position: relative;
  margin-right: 1rem;
}

.chat-user-details {
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.chat-user-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-online {
  color: #4caf50;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-offline {
  color: #666;
  font-size: 0.8rem;
}

.tier-badge {
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mensajes */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 1rem;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-avatar {
  margin-right: 0.5rem;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;
  margin-bottom: 0.25rem;
}

.message-sent .message-bubble {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-received .message-bubble {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 6px;
}

.message-image {
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 0.25rem;
}

.image-placeholder {
  font-size: 1.2rem;
  color: #666;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
  margin-top: 0.25rem;
}

.message-received .message-time {
  text-align: left;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.typing-dots {
  display: flex;
  gap: 3px;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Input de mensaje */
.message-input-container {
  border-top: 1px solid #e0e0e0;
  background: white;
  padding: 1rem;
  position: relative;
}

.message-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-field {
  flex: 1;
}

.message-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  border-color: #667eea;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 80px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.emoji-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.emoji-btn:hover {
  background: #f0f0f0;
}

/* Panel de información */
.info-panel {
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.creator-profile {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.profile-avatar {
  margin-bottom: 1rem;
}

.creator-profile h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.creator-category {
  color: #667eea;
  font-weight: 500;
  margin-bottom: 1rem;
}

.tier-info {
  margin-top: 1rem;
}

.panel-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.panel-section h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.action-icon {
  font-size: 1.1rem;
}

.shared-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.file-item:hover {
  background: #e8f2ff;
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive */
@media (max-width: 1024px) {
  .messaging-container {
    grid-template-columns: 280px 1fr;
  }

  .info-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .messaging-container {
    grid-template-columns: 1fr;
  }

  .conversations-sidebar {
    display: none;
  }

  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .message-input-wrapper {
    flex-wrap: wrap;
  }

  .input-field {
    order: 1;
    flex: 1 1 100%;
  }
}
</style>