<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // Minimal reactive data
      searchQuery: '',
      activeCategory: 'all',

      // Creators data from backend
      creators: [],
      loading: false,
      error: null,

      categories: ['all', 'Arte Digital', 'Música', 'Tecnología', 'Cocina']
    }
  },

  async mounted() {
    await this.fetchCreators()
  },

  methods: {
    async fetchCreators() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://52.146.18.37:8000/api/users')

        if (!response.ok) {
          throw new Error('Error al cargar los creadores')
        }

        const data = await response.json()
        this.creators = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching creators:', error)
      } finally {
        this.loading = false
      }
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
              placeholder="Buscar creadores..."
              class="search-input"
          >
          <button class="search-btn">Buscar</button>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <h2 class="section-title">Creadores Destacados</h2>

        <!-- Category Filter -->
        <div class="category-filter">
          <button
              v-for="category in categories"
              :key="category"
              @click="activeCategory = category"
              :class="['category-btn', { active: activeCategory === category }]"
          >
            {{ category === 'all' ? 'Todos' : category }}
          </button>
        </div>

        <!-- Creators Grid -->
        <div class="creators-grid">
          <div
              v-for="creator in creators"
              :key="creator.id"
              class="creator-card"
          >
            <div class="creator-banner" :style="{ background: creator.bannerColor }">
              <div class="creator-avatar">{{ creator.avatar }}</div>
            </div>

            <div class="creator-info">
              <h3 class="creator-name">{{ creator.name }}</h3>
              <p class="creator-category">{{ creator.category }}</p>
              <p class="creator-description">{{ creator.description }}</p>

              <div class="creator-stats">
                <div class="stat">
                  <span class="stat-number">{{ creator.patrons }}</span>
                  <span class="stat-label">Patrocinadores</span>
                </div>
                <div class="stat">
                  <span class="stat-number">${{ creator.monthlyGoal }}</span>
                  <span class="stat-label">Meta mensual</span>
                </div>
              </div>

              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (creator.patrons / creator.monthlyGoal * 100) + '%' }"></div>
              </div>

              <div class="creator-actions">
                <button class="btn btn-primary">Convertirme en Patrón</button>
                <button class="btn btn-secondary">Ver Perfil</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Content Section -->
        <section class="featured-content">
          <h2 class="section-title">Contenido Destacado</h2>
          <div class="content-grid">
            <div class="content-card">
              <div class="content-image">🎨</div>
              <h3>Tutorial: Pintura Digital</h3>
              <p>Aprende técnicas avanzadas de pintura digital con Ana García</p>
              <span class="content-tag">Exclusivo para Patrones</span>
            </div>

            <div class="content-card">
              <div class="content-image">🎵</div>
              <h3>Nueva Canción: "Caminos"</h3>
              <p>Escucha en primicia la nueva composición de Carlos Música</p>
              <span class="content-tag">Acceso Anticipado</span>
            </div>

            <div class="content-card">
              <div class="content-image">💻</div>
              <h3>Curso: React Avanzado</h3>
              <p>Domina React con este curso completo de Tech Explica</p>
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
            <a href="#">Patrocinadores</a>
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

/* Creators Grid */
.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.creator-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.creator-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.creator-banner {
  height: 150px;
  position: relative;
}

.creator-avatar {
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
  font-size: 2rem;
}

.creator-info {
  padding: 3rem 1.5rem 1.5rem;
}

.creator-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.creator-category {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.creator-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.creator-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.creator-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.creator-actions .btn {
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

  .creators-grid {
    grid-template-columns: 1fr;
  }

  .creator-actions {
    flex-direction: column;
  }
}
</style>