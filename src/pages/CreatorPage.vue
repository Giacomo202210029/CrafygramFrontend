<script>
export default {
  name: 'CreatorPage',
  data() {
    return {
      // Reactive data
      activeTab: 'posts',
      selectedTier: null,
      isFollowing: false,
      showAllTiers: false,
      creator: null,
      posts: [],

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
    },

    // Computed properties ajustadas al JSON
    creatorName() {
      return this.creator?.profile?.name || 'Creador'
    },

    creatorUsername() {
      return this.creator?.username || 'username'
    },

    creatorEmail() {
      return this.creator?.email || ''
    },

    creatorBio() {
      return this.creator?.profile?.bio || 'Sin biografía disponible'
    },

    creatorAvatar() {
      // Verificar si tiene avatar válido (no placeholder)
      const avatarUrl = this.creator?.profile?.avatar_url
      return avatarUrl && avatarUrl !== '/media/avatars/...' ? avatarUrl : null
    },

    creatorInitials() {
      const name = this.creator?.profile?.name
      if (!name) return 'U'
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    },

    creatorRole() {
      return this.creator?.role || 'user'
    },

    isArtist() {
      return this.creator?.role === 'artist'
    },

    socialLinks() {
      return this.creator?.profile?.social_links || {}
    },

    creatorUniversity() {
      return this.creator?.profile?.university || 'Universidad no especificada'
    },

    memberSince() {
      if (!this.creator?.created_at) return 'Fecha no disponible'
      const date = new Date(this.creator.created_at)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    // Determinar categoría basada en rol y perfil
    creatorCategory() {
      if (this.creator?.role === 'artist') {
        return 'Artista Digital'
      }
      return 'Creador de Contenido'
    },

    // Generar descripción más detallada
    creatorDescription() {
      const bio = this.creator?.profile?.bio || ''
      const university = this.creator?.profile?.university || ''
      const role = this.creator?.role || ''

      let description = bio
      if (university && university !== 'Universidad no especificada') {
        description += ` Estudia en ${university}.`
      }
      if (role === 'artist') {
        description += ' Especializado en arte digital y diseño gráfico.'
      }

      return description || 'Creador de contenido apasionado por compartir su arte y conocimientos.'
    },

    // Formatear enlaces sociales
    formattedSocialLinks() {
      const links = this.socialLinks
      const formatted = {}

      Object.keys(links).forEach(platform => {
        const value = links[platform]
        if (value) {
          // Si es un handle (empieza con @), mantenerlo
          if (value.startsWith('@')) {
            formatted[platform] = value
          }
          // Si es una URL completa, extraer el handle
          else if (value.includes('/')) {
            const handle = value.split('/').pop()
            formatted[platform] = `@${handle}`
          }
          // Si es solo el nombre de usuario
          else {
            formatted[platform] = value.startsWith('@') ? value : `@${value}`
          }
        }
      })

      return formatted
    }
  },

  async mounted() {
    await this.initializeData()
  },

  watch: {
    // Vigilar cambios en la ruta para recargar datos
    '$route.params.userId': {
      handler: function(newUserId) {
        if (newUserId) {
          this.initializeData()
        }
      },
      immediate: false
    }
  },

  methods: {
    async initializeData() {
      this.loading = true
      this.error = null

      try {
        // Obtener ID del creador desde la ruta
        const userId = this.$route.params.userId;
        console.log("userid" + userId);

        if (!userId) {
          throw new Error('ID de usuario no encontrado en la ruta')
        }

        // Cargar datos en paralelo
        await Promise.all([
          this.fetchCreator(userId),
          this.fetchPosts(userId)
        ])

        // Verificar si el usuario ya sigue al creador
        await this.checkFollowStatus(userId)

      } catch (error) {
        this.error = error.message
        console.error('Error initializing data:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCreator(userId) {
      this.creatorLoading = true

      try {
        // Obtener todos los usuarios desde la API
        const response = await fetch(`http://52.146.18.37:8000/api/users`)

        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }

        const users = await response.json()

        // Buscar el usuario específico por ID
        const foundCreator = users.find(user => user._id === userId)

        if (!foundCreator) {
          throw new Error('Creador no encontrado')
        }

        // Validar estructura del JSON
        if (!foundCreator.profile) {
          foundCreator.profile = {
            name: foundCreator.username || 'Usuario',
            bio: 'Sin biografía disponible',
            avatar_url: '/media/avatars/...',
            university: 'Universidad no especificada',
            social_links: {}
          }
        }

        // Agregar stats simuladas si no existen
        this.creator = {
          ...foundCreator,
          stats: foundCreator.stats || {
            followers: Math.floor(Math.random() * 1000) + 100,
            patrons: Math.floor(Math.random() * 50) + 10,
            monthlyEarnings: Math.floor(Math.random() * 3000) + 500,
            posts: Math.floor(Math.random() * 100) + 20
          }
        }

        console.log('Creator loaded:', this.creator)

      } catch (error) {
        console.error('Error fetching creator:', error)
        throw error
      } finally {
        this.creatorLoading = false
      }
    },

    async fetchPosts(userId) {
      this.postsLoading = true

      try {
        // Simular posts mientras no tengamos endpoint real
        // En producción, esto sería: `/api/users/${userId}/posts`

        // Datos simulados de posts
        this.posts = [
          {
            id: 1,
            title: 'Mi último trabajo digital',
            content: 'Quería compartir con ustedes mi última obra...',
            image: '/placeholder-art.jpg',
            tier: 'Público',
            likes: 42,
            comments: 8,
            timestamp: 'hace 2 horas',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Tutorial: Técnicas de sombreado',
            content: 'En este tutorial aprenderán las técnicas básicas...',
            image: '/placeholder-tutorial.jpg',
            tier: 'Artista',
            likes: 89,
            comments: 15,
            timestamp: 'hace 1 día',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            title: 'Proceso creativo: De la idea al resultado',
            content: 'Les muestro todo mi proceso desde la conceptualización...',
            image: '/placeholder-process.jpg',
            tier: 'Aprendiz',
            likes: 156,
            comments: 23,
            timestamp: 'hace 2 días',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]

      } catch (error) {
        console.error('Error fetching posts:', error)
        throw error
      } finally {
        this.postsLoading = false
      }
    },

    async checkFollowStatus(userId) {
      try {
        // Simular estado de seguimiento
        // En producción: `/api/users/${userId}/follow-status`
        this.isFollowing = Math.random() > 0.5
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
        // En producción: `/api/users/${this.creator._id}/follow`
        const response = await fetch(`/api/users/${this.creator._id}/follow`, {
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

        // Simular actualización local para demo
        if (this.creator.stats) {
          this.creator.stats.followers += this.isFollowing ? 1 : -1
        }
      }
    },

    async subscribeTo(tierId) {
      if (!this.creator) return

      try {
        // En producción: `/api/users/${this.creator._id}/subscribe`
        const response = await fetch(`/api/users/${this.creator._id}/subscribe`, {
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
        } else if (this.creator.stats) {
          // Simular actualización local
          this.creator.stats.patrons += 1
        }

        // Opcional: recargar posts para mostrar contenido del nuevo tier
        await this.fetchPosts(this.creator._id)

      } catch (error) {
        console.error('Error subscribing:', error)
        // Simular suscripción local para demo
        this.selectedTier = tierId
        if (this.creator.stats) {
          this.creator.stats.patrons += 1
        }
      }
    },

    switchTab(tab) {
      this.activeTab = tab
    },

    toggleShowAllTiers() {
      this.showAllTiers = !this.showAllTiers
    },

    goBack() {
      this.$router.go(-1)
    },

    // Función para obtener iniciales del avatar
    getAvatarDisplay() {
      if (this.creatorAvatar) {
        return `url(${this.creatorAvatar})`
      }
      return this.creatorInitials
    },

    // Función para determinar si mostrar imagen o iniciales
    shouldShowInitials() {
      return !this.creatorAvatar
    }
  }
}
</script>

<template>
  <div class="creator-profile">
    <!-- Header with back navigation -->
    <header class="profile-header">
      <div class="container">
        <button class="back-btn" @click="goBack">
          <span>←</span> Volver a Creadores
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">Cargando perfil...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Error al cargar el perfil</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="initializeData">Reintentar</button>
      </div>
    </div>

    <!-- Creator Profile Content -->
    <div v-else-if="creator">
      <!-- Creator Banner -->
      <section class="creator-banner">
        <div class="banner-bg"></div>
        <div class="container">
          <div class="creator-main-info">
            <div class="creator-avatar-large" :class="{ 'has-image': !shouldShowInitials() }">
              <img v-if="creatorAvatar" :src="creatorAvatar" :alt="creatorName" class="avatar-image">
              <span v-else class="avatar-initials">{{ creatorInitials }}</span>
            </div>
            <div class="creator-details">
              <h1 class="creator-name">{{ creatorName }}</h1>
              <p class="creator-username">@{{ creatorUsername }}</p>
              <p class="creator-category">{{ creatorCategory }}</p>
              <p class="creator-description">{{ creatorDescription }}</p>

              <div class="creator-stats-bar">
                <div class="stat-item">
                  <span class="stat-number">{{ creator.stats.patrons }}</span>
                  <span class="stat-label">Mecenas</span>
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
                <button class="btn btn-primary" @click="subscribeTo(2)">
                  Convertirme en Patrón
                </button>
                <button
                    class="btn btn-secondary"
                    :class="{ active: isFollowing }"
                    @click="toggleFollow"
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
                    @click="switchTab('posts')"
                >
                  Posts
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'about' }"
                    @click="switchTab('about')"
                >
                  Acerca de
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'community' }"
                    @click="switchTab('community')"
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
                    <div class="post-avatar">
                      <img v-if="creatorAvatar" :src="creatorAvatar" :alt="creatorName" class="avatar-image">
                      <span v-else class="avatar-initials">{{ creatorInitials }}</span>
                    </div>
                    <div class="post-meta">
                      <h4 class="post-author">{{ creatorName }}</h4>
                      <span class="post-time">{{ post.timestamp }}</span>
                      <span class="post-tier" :class="'tier-' + post.tier.toLowerCase()">
                        {{ post.tier }}
                      </span>
                    </div>
                  </div>

                  <div class="post-content">
                    <h3 class="post-title">{{ post.title }}</h3>
                    <p class="post-text">{{ post.content }}</p>
                    <div class="post-image">🎨</div>
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
                  <h3>Sobre {{ creatorName }}</h3>
                  <p>{{ creatorBio }}</p>
                  <p><strong>Universidad:</strong> {{ creatorUniversity }}</p>
                  <p><strong>Rol:</strong> {{ creatorRole === 'artist' ? 'Artista' : 'Usuario' }}</p>
                  <p><strong>Miembro desde:</strong> {{ memberSince }}</p>

                  <h4>Redes Sociales</h4>
                  <div class="social-links">
                    <a v-for="(handle, platform) in formattedSocialLinks"
                       :key="platform"
                       href="#"
                       class="social-link">
                      <span v-if="platform === 'instagram'">📷</span>
                      <span v-else-if="platform === 'tiktok'">🎵</span>
                      <span v-else-if="platform === 'twitter'">🐦</span>
                      <span v-else-if="platform === 'youtube'">📺</span>
                      <span v-else>🔗</span>
                      {{ handle }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Community Content -->
              <div v-else-if="activeTab === 'community'" class="community-content">
                <h3>Comunidad</h3>
                <p>Únete a {{ creator.stats.patrons }} Mecenas que apoyan a {{ creatorName }}</p>
                <div class="community-stats">
                  <div class="community-stat">
                    <span class="stat-number">{{ creator.stats.patrons }}</span>
                    <span class="stat-label">Mecenas activos</span>
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
                      @click="subscribeTo(tier.id)"
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
                  @click="toggleShowAllTiers"
              >
                Ver más niveles
              </button>
            </div>
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

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.loading-spinner {
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message h3 {
  color: #dc3545;
  margin-bottom: 1rem;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-top: 100px;
  flex-shrink: 0;
  overflow: hidden;
}

.creator-avatar-large.has-image {
  padding: 0;
  background: #f8f9fa;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-initials {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
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

</style>