<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // Minimal reactive data
      searchQuery: '',
      activeCategory: 'all',

      // Users data from backend
      users: [],
      loading: false,
      error: null,

      categories: ['all', 'artist', 'patron'],

      // Editable array of avatar URLs to replace backend avatars
      avatarUrls: [
        'https://media.printler.com/media/photo/193484-2.jpg?rmode=crop&width=638&height=900',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      ]
    }
  },

  computed: {
    filteredUsers() {
      let filtered = this.users;

      // Filter by category
      if (this.activeCategory !== 'all') {
        filtered = filtered.filter(user => user.role === this.activeCategory);
      }

      // Filter by search query
      if (this.searchQuery) {
        filtered = filtered.filter(user =>
            user.profile.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.profile.bio.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      return filtered;
    },

    categoryLabel() {
      return {
        'all': 'Todos',
        'artist': 'Artistas',
        'patron': 'Mecenas'
      };
    }
  },

  async mounted() {
    await this.fetchUsers()
  },

  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://52.146.18.37:8000/api/users')

        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }

        const data = await response.json()

        // Replace avatar URLs with our custom ones
        this.users = data.map((user, index) => ({
          ...user,
          profile: {
            ...user.profile,
            avatar_url: this.avatarUrls[index % this.avatarUrls.length]
          }
        }))
      } catch (error) {
        this.error = error.message
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    getUserInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },

    getRandomColor() {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    viewProfile(user) {

      const userId = user._id;
      this.$router.push(`/creator/${userId}`)

    },

    getRoleLabel(role) {
      return role === 'artist' ? 'Artista' : 'Patrocinador';
    },

    handleImageError(event, user) {
      // If image fails to load, hide it and show initials instead
      event.target.style.display = 'none';
      user.profile.avatar_url = null;
    }
  }
}
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">CreatorHub</div>
          <ul class="nav-links">
            <li><a href="#home">Inicio</a></li>
            <li><a href="#explore">Explorar</a></li>
            <li><a href="#categories">Categorías</a></li>
            <li><a href="#about">Acerca de</a></li>
          </ul>
          <div class="user-actions">
            <a href="#login" class="btn btn-secondary">Iniciar Sesión</a>
            <a href="#signup" class="btn btn-primary">Registrarse</a>
          </div>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>Apoya a tus creadores favoritos</h1>
        <p>Descubre contenido exclusivo y conecta directamente con los creadores que más admiras</p>
        <div class="search-bar">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, usuario o biografía..."
              class="search-input"
          >
          <button class="search-btn">Buscar</button>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <h2 class="section-title">Comunidad CreatorHub</h2>

        <!-- Category Filter -->
        <div class="category-filter">
          <button
              v-for="category in categories"
              :key="category"
              @click="activeCategory = category"
              :class="['category-btn', { active: activeCategory === category }]"
          >
            {{ categoryLabel[category] }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchUsers" class="btn btn-primary">Reintentar</button>
        </div>

        <!-- Users Grid -->
        <div v-if="!loading && !error" class="users-grid">
          <div
              v-for="user in filteredUsers"
              :key="user._id"
              class="user-card"
          >
            <div class="user-banner" :style="{ background: getRandomColor() }">
              <div class="user-avatar">
                <img v-if="user.profile.avatar_url && user.profile.avatar_url !== '/media/avatars/...'"
                     :src="user.profile.avatar_url"
                     :alt="user.profile.name"
                     class="avatar-img">
                <span v-else class="avatar-initials">{{ getUserInitials(user.profile.name) }}</span>
              </div>
              <div class="role-badge" :class="user.role">
                {{ getRoleLabel(user.role) }}
              </div>
            </div>

            <div class="user-info">
              <h3 class="user-name">{{ user.profile.name }}</h3>
              <p class="user-username">@{{ user.username }}</p>
              <p class="user-bio">{{ user.profile.bio }}</p>

              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-label">Universidad:</span>
                  <span class="detail-value">{{ user.profile.university }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Miembro desde:</span>
                  <span class="detail-value">{{ formatDate(user.created_at) }}</span>
                </div>
              </div>

              <div class="social-links" v-if="user.profile.social_links">
                <a v-if="user.profile.social_links.instagram"
                   :href="'https://instagram.com/' + user.profile.social_links.instagram.replace('@', '')"
                   target="_blank"
                   class="social-link instagram">
                  📷 Instagram
                </a>
                <a v-if="user.profile.social_links.tiktok"
                   :href="user.profile.social_links.tiktok"
                   target="_blank"
                   class="social-link tiktok">
                  🎵 TikTok
                </a>
              </div>

              <div class="user-actions">
                <button v-if="user.role === 'artist'" class="btn btn-primary">
                  Convertirme en Patrón
                </button>
                <button v-else class="btn btn-secondary">
                  Ver Artistas
                </button>
                <button @click="viewProfile(user)"
                        class="btn btn-outline">
                  Ver Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && !error && filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No se encontraron usuarios</h3>
          <p>Intenta cambiar los filtros o el término de búsqueda</p>
        </div>

        <!-- Featured Content Section -->
        <section class="featured-content">
          <h2 class="section-title">Contenido Destacado</h2>
          <div class="content-grid">
            <div class="content-card">
              <div class="content-image">🎨</div>
              <h3>Tutorial: Pintura Digital</h3>
              <p>Aprende técnicas avanzadas de pintura digital con nuestros artistas</p>
              <span class="content-tag">Exclusivo para Patrones</span>
            </div>

            <div class="content-card">
              <div class="content-image">🎵</div>
              <h3>Nueva Canción: "Caminos"</h3>
              <p>Escucha en primicia las nuevas composiciones de nuestros músicos</p>
              <span class="content-tag">Acceso Anticipado</span>
            </div>

            <div class="content-card">
              <div class="content-image">💻</div>
              <h3>Curso: Diseño Gráfico</h3>
              <p>Domina las herramientas de diseño con nuestros expertos</p>
              <span class="content-tag">Serie Completa</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>CreatorHub</h3>
            <p>Conectando creadores con su audiencia</p>
          </div>
          <div class="footer-section">
            <h4>Comunidad</h4>
            <a href="#">Creadores</a>
            <a href="#">Mecenas</a>
            <a href="#">Blog</a>
          </div>
          <div class="footer-section">
            <h4>Soporte</h4>
            <a href="#">Centro de Ayuda</a>
            <a href="#">Contacto</a>
            <a href="#">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

.user-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-outline:hover {
  background: #f5f5f5;
  border-color: #333;
}

/* Hero Section */
.hero {
  padding: 4rem 0;
  text-align: center;
  color: white;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-bar {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 120px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  outline: none;
}

.search-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  bottom: 5px;
  padding: 0 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.05);
}

/* Main Content */
.main-content {
  background: white;
  padding: 3rem 0;
  min-height: 80vh;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
  font-weight: 700;
}

/* Category Filter */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.category-btn.active,
.category-btn:hover {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.user-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.user-banner {
  height: 150px;
  position: relative;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  position: absolute;
  bottom: -40px;
  left: 20px;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1.2rem;
  font-weight: bold;
}

.role-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.role-badge.artist {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.role-badge.patron {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.user-info {
  padding: 3rem 1.5rem 1.5rem;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.user-username {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.user-bio {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.user-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: #333;
}

.detail-value {
  color: #666;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-link {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f093fb, #f5576c);
  color: white;
}

.social-link.tiktok {
  background: linear-gradient(45deg, #ff0050, #ff4081);
  color: white;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.user-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-actions .btn {
  flex: 1;
  min-width: 120px;
}

/* Featured Content */
.featured-content {
  margin-top: 4rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.content-image {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.content-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.content-card p {
  color: #666;
  margin-bottom: 1rem;
}

.content-tag {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Footer */
.footer {
  background: #333;
  color: white;
  padding: 3rem 0;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: white;
}

.footer-section a {
  display: block;
  color: #ccc;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 1rem;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .user-actions {
    flex-direction: column;
  }

  .social-links {
    flex-direction: column;
  }
}
</style>