<script>
export default {
  data() {
    return {
      // Reactive data
      activeTab: 'posts',
      selectedTier: null,
      isFollowing: false,
      showAllTiers: false,

      // Creator data from backend
      creator: null,

      // Posts data from backend
      posts: [],

      // Loading states
      loading: false,
      creatorLoading: false,
      postsLoading: false,
      error: null,

      // Subscription tiers (keep as static data)
      tiers: [
        {
          id: 1,
          name: 'Seguidor',
          price: 0,
          currency: 'USD',
          description: 'Acceso básico a contenido público',
          benefits: [
            'Acceso a posts públicos',
            'Comentarios en publicaciones',
            'Actualizaciones del creador'
          ],
          color: '#6c757d'
        },
        {
          id: 2,
          name: 'Aprendiz',
          price: 5,
          currency: 'USD',
          description: 'Para quienes quieren aprender técnicas básicas',
          benefits: [
            'Todo del tier anterior',
            'Tutoriales básicos exclusivos',
            'Timelapses de proceso creativo',
            'Wallpapers HD mensuales'
          ],
          color: '#28a745',
          popular: false
        },
        {
          id: 3,
          name: 'Artista',
          price: 15,
          currency: 'USD',
          description: 'Para artistas que buscan perfeccionar su técnica',
          benefits: [
            'Todo del tier anterior',
            'Tutoriales avanzados paso a paso',
            'Archivos .PSD de mis obras',
            'Feedback personalizado en tus trabajos',
            'Acceso a livestreams privados'
          ],
          color: '#007bff',
          popular: true
        },
        {
          id: 4,
          name: 'Maestro',
          price: 30,
          currency: 'USD',
          description: 'La experiencia completa para profesionales',
          benefits: [
            'Todo del tier anterior',
            'Videollamadas 1-on-1 mensuales',
            'Recursos y brushes exclusivos',
            'Acceso a mi biblioteca de referencias',
            'Colaboraciones en proyectos',
            'Descuentos en comisiones personalizadas'
          ],
          color: '#6f42c1',
          popular: false
        }
      ]
    }
  },

  computed: {
    displayedTiers() {
      return this.showAllTiers ? this.tiers : this.tiers.slice(0, 3)
    },

    progressPercentage() {
      if (!this.creator || !this.creator.stats) return 0
      const goal = 5000
      return Math.min((this.creator.stats.monthlyEarnings / goal) * 100, 100)
    }
  },

  async mounted() {
    await this.initializeData()
  },

  methods: {
    async initializeData() {
      this.loading = true
      this.error = null

      try {
        // Obtener ID del creador desde la ruta
        const creatorId = this.$route.params.id || 1

        // Cargar datos en paralelo
        await Promise.all([
          this.fetchCreator(creatorId),
          this.fetchPosts(creatorId)
        ])

        // Verificar si el usuario ya sigue al creador
        await this.checkFollowStatus(creatorId)

      } catch (error) {
        this.error = error.message
        console.error('Error initializing data:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCreator(creatorId) {
      this.creatorLoading = true

      try {
        const response = await fetch(`http://52.146.18.37:8000/api/users`)

        if (!response.ok) {
          throw new Error('Error al cargar el creador')
        }

        const data = await response.json()
        this.creator = data
      } catch (error) {
        console.error('Error fetching creator:', error)
        throw error
      } finally {
        this.creatorLoading = false
      }
    },

    async fetchPosts(creatorId) {
      this.postsLoading = true

      try {
        const response = await fetch(`/api/creators/${creatorId}/posts`)

        if (!response.ok) {
          throw new Error('Error al cargar los posts')
        }

        const data = await response.json()
        this.posts = data
      } catch (error) {
        console.error('Error fetching posts:', error)
        throw error
      } finally {
        this.postsLoading = false
      }
    },

    async checkFollowStatus(creatorId) {
      try {
        const response = await fetch(`/api/creators/${creatorId}/follow-status`)

        if (response.ok) {
          const data = await response.json()
          this.isFollowing = data.isFollowing
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    },

    async toggleFollow() {
      if (!this.creator) return

      const previousState = this.isFollowing

      // Actualizar UI optimísticamente
      this.isFollowing = !this.isFollowing

      try {
        const response = await fetch(`/api/creators/${this.creator.id}/follow`, {
          method: this.isFollowing ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al actualizar el seguimiento')
        }

        const data = await response.json()

        // Actualizar stats del creador si están disponibles
        if (data.followerCount !== undefined && this.creator.stats) {
          this.creator.stats.followers = data.followerCount
        }

      } catch (error) {
        console.error('Error toggling follow:', error)
        // Revertir cambios en caso de error
        this.isFollowing = previousState
      }
    },

    async subscribeTo(tierId) {
      if (!this.creator) return

      try {
        const response = await fetch(`/api/creators/${this.creator.id}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tierId: tierId
          })
        })

        if (!response.ok) {
          throw new Error('Error al suscribirse')
        }

        const data = await response.json()

        // Actualizar tier seleccionado
        this.selectedTier = tierId

        // Actualizar stats del creador si están disponibles
        if (data.patronCount !== undefined && this.creator.stats) {
          this.creator.stats.patrons = data.patronCount
        }

        // Opcional: recargar posts para mostrar contenido del nuevo tier
        await this.fetchPosts(this.creator.id)

      } catch (error) {
        console.error('Error subscribing:', error)
      }
    },

    switchTab(tab) {
      this.activeTab = tab
    },

    toggleShowAllTiers() {
      this.showAllTiers = !this.showAllTiers
    }
  }
}
</script>

<template>
  <div class="creator-profile">
    <!-- Header with back navigation -->
    <header class="profile-header">
      <div class="container">
        <button class="back-btn">
          <span>←</span> Volver a Creadores
        </button>
      </div>
    </header>

    <!-- Creator Banner -->
    <section class="creator-banner">
      <div class="banner-bg" :style="{ background: creator.bannerImage }"></div>
      <div class="container">
        <div class="creator-main-info">
          <div class="creator-avatar-large">{{ creator.avatar }}</div>
          <div class="creator-details">
            <h1 class="creator-name">{{ creator.name }}</h1>
            <p class="creator-username">{{ creator.username }}</p>
            <p class="creator-category">{{ creator.category }}</p>
            <p class="creator-description">{{ creator.description }}</p>

            <div class="creator-stats-bar">
              <div class="stat-item">
                <span class="stat-number">{{ creator.stats.patrons }}</span>
                <span class="stat-label">Patrocinadores</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ creator.stats.posts }}</span>
                <span class="stat-label">Posts</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ creator.stats.followers }}</span>
                <span class="stat-label">Seguidores</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${{ creator.stats.monthlyEarnings }}</span>
                <span class="stat-label">Mensuales</span>
              </div>
            </div>

            <div class="creator-actions">
              <button class="btn btn-primary">Convertirme en Patrón</button>
              <button
                  class="btn btn-secondary"
                  :class="{ active: isFollowing }"
                  @click="isFollowing = !isFollowing"
              >
                {{ isFollowing ? 'Siguiendo' : 'Seguir' }}
              </button>
              <button class="btn btn-outline">Compartir</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Progress Goal -->
    <section class="progress-section">
      <div class="container">
        <div class="progress-card">
          <h3>Meta del mes: $5,000</h3>
          <div class="progress-bar-large">
            <div class="progress-fill-large" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">
            ${{ creator.stats.monthlyEarnings }} de $5,000 ({{ Math.round(progressPercentage) }}%)
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <div class="content-layout">
          <!-- Left Column - Posts -->
          <div class="posts-section">
            <div class="section-tabs">
              <button
                  class="tab-btn"
                  :class="{ active: activeTab === 'posts' }"
                  @click="activeTab = 'posts'"
              >
                Posts
              </button>
              <button
                  class="tab-btn"
                  :class="{ active: activeTab === 'about' }"
                  @click="activeTab = 'about'"
              >
                Acerca de
              </button>
              <button
                  class="tab-btn"
                  :class="{ active: activeTab === 'community' }"
                  @click="activeTab = 'community'"
              >
                Comunidad
              </button>
            </div>

            <!-- Posts Content -->
            <div v-if="activeTab === 'posts'" class="posts-container">
              <div
                  v-for="post in posts"
                  :key="post.id"
                  class="post-card"
              >
                <div class="post-header">
                  <div class="post-avatar">{{ creator.avatar }}</div>
                  <div class="post-meta">
                    <h4 class="post-author">{{ creator.name }}</h4>
                    <span class="post-time">{{ post.timestamp }}</span>
                    <span class="post-tier" :class="'tier-' + post.tier.toLowerCase()">
                      {{ post.tier }}
                    </span>
                  </div>
                </div>

                <div class="post-content">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-text">{{ post.content }}</p>
                  <div class="post-image">{{ post.image }}</div>
                </div>

                <div class="post-actions">
                  <button class="action-btn">
                    <span>👍</span> {{ post.likes }}
                  </button>
                  <button class="action-btn">
                    <span>💬</span> {{ post.comments }}
                  </button>
                  <button class="action-btn">
                    <span>📤</span> Compartir
                  </button>
                </div>
              </div>
            </div>

            <!-- About Content -->
            <div v-else-if="activeTab === 'about'" class="about-content">
              <div class="about-section">
                <h3>Sobre {{ creator.name }}</h3>
                <p>{{ creator.description }}</p>
                <p>Miembro desde: {{ creator.memberSince }}</p>

                <h4>Redes Sociales</h4>
                <div class="social-links">
                  <a href="#" class="social-link">📷 {{ creator.socialLinks.instagram }}</a>
                  <a href="#" class="social-link">🐦 {{ creator.socialLinks.twitter }}</a>
                  <a href="#" class="social-link">📺 {{ creator.socialLinks.youtube }}</a>
                </div>
              </div>
            </div>

            <!-- Community Content -->
            <div v-else-if="activeTab === 'community'" class="community-content">
              <h3>Comunidad</h3>
              <p>Únete a {{ creator.stats.patrons }} patrocinadores que apoyan a {{ creator.name }}</p>
              <div class="community-stats">
                <div class="community-stat">
                  <span class="stat-number">{{ creator.stats.patrons }}</span>
                  <span class="stat-label">Patrocinadores activos</span>
                </div>
                <div class="community-stat">
                  <span class="stat-number">{{ creator.stats.posts }}</span>
                  <span class="stat-label">Posts publicados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Tiers -->
          <div class="tiers-section">
            <h3 class="tiers-title">Niveles de Suscripción</h3>

            <div class="tiers-container">
              <div
                  v-for="tier in displayedTiers"
                  :key="tier.id"
                  class="tier-card"
                  :class="{
                  popular: tier.popular,
                  selected: selectedTier === tier.id
                }"
                  @click="selectedTier = tier.id"
              >
                <div class="tier-header">
                  <h4 class="tier-name">{{ tier.name }}</h4>
                  <div class="tier-price">
                    <span class="price-amount">${{ tier.price }}</span>
                    <span class="price-period" v-if="tier.price > 0">/mes</span>
                  </div>
                </div>

                <p class="tier-description">{{ tier.description }}</p>

                <ul class="tier-benefits">
                  <li v-for="benefit in tier.benefits" :key="benefit">
                    <span class="benefit-icon">✓</span>
                    {{ benefit }}
                  </li>
                </ul>

                <button
                    class="btn tier-btn"
                    :class="tier.price === 0 ? 'btn-secondary' : 'btn-primary'"
                >
                  {{ tier.price === 0 ? 'Seguir Gratis' : 'Seleccionar' }}
                </button>

                <div v-if="tier.popular" class="popular-badge">
                  ⭐ Más Popular
                </div>
              </div>
            </div>

            <button
                v-if="!showAllTiers && tiers.length > 3"
                class="show-more-tiers"
                @click="showAllTiers = true"
            >
              Ver más niveles
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.creator-profile {
  background: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.profile-header {
  background: white;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f0f0f0;
  color: #333;
}

/* Creator Banner */
.creator-banner {
  position: relative;
  background: white;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  z-index: 1;
}

.creator-main-info {
  position: relative;
  z-index: 2;
  padding: 2rem 0;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.creator-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-top: 100px;
  flex-shrink: 0;
}

.creator-details {
  flex: 1;
  margin-top: 120px;
}

.creator-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.creator-username {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.creator-category {
  color: #667eea;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.creator-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
}

.creator-stats-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.creator-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
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
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover,
.btn-secondary.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* Progress Section */
.progress-section {
  background: white;
  padding: 2rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.progress-card {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.progress-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  color: #666;
  font-size: 0.9rem;
}

/* Main Content */
.main-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

/* Posts Section */
.posts-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-btn:hover {
  background: #f8f9fa;
}

.posts-container {
  padding: 1rem;
}

.post-card {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.post-card:hover {
  background: #f8f9fa;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.post-meta {
  flex: 1;
}

.post-author {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.post-time {
  color: #666;
  font-size: 0.9rem;
  margin-right: 1rem;
}

.post-tier {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tier-público {
  background: #e3f2fd;
  color: #1976d2;
}

.tier-artista {
  background: #e8f5e8;
  color: #2e7d32;
}

.tier-aprendiz {
  background: #fff3e0;
  color: #f57c00;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.post-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-image {
  font-size: 3rem;
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #333;
}

/* About & Community Content */
.about-content,
.community-content {
  padding: 2rem;
}

.about-section h3,
.community-content h3 {
  margin-bottom: 1rem;
  color: #333;
}

.about-section h4 {
  margin: 1.5rem 0 0.5rem;
  color: #333;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.social-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #764ba2;
}

.community-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.community-stat {
  text-align: center;
}

/* Tiers Section */
.tiers-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.tiers-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
}

.tiers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tier-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tier-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tier-card.popular {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.tier-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.tier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tier-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.tier-price {
  text-align: right;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.price-period {
  font-size: 0.9rem;
  color: #666;
}

.tier-description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.tier-benefits {
  list-style: none;
  margin-bottom: 1.5rem;
}

.tier-benefits li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.benefit-icon {
  color: #28a745;
  font-weight: bold;
}

.tier-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: 10px;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.show-more-tiers {
  width: 100%;
  padding: 1rem;
  background: none;
  border: 2px dashed #e0e0e0;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.show-more-tiers:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 968px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .tiers-section {
    position: static;
  }

  .creator-main-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .creator-avatar-large {
    margin-top: 50px;
  }

  .creator-details {
    margin-top: 1rem;
  }

  .creator-stats-bar {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .creator-actions {
    flex-direction: column;
  }

  .creator-actions .btn {
    width: 100%;
  }

  .creator-stats-bar {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .post-actions {
    flex-wrap: wrap;
  }
}
</style>