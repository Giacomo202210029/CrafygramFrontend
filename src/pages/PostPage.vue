<script>
export default {
  name: 'PostPage',
  data() {
    return {
      // Minimal reactive data
      newComment: '',
      showComments: true,
      likeCount: 0,
      isLiked: false,

      // Post data from backend
      post: null,

      // Comments data from backend
      comments: [],

      // Loading states
      loading: false,
      commentsLoading: false,
      postLoading: false,
      error: null
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
        // Obtener ID del post desde la ruta
        const postId = this.$route.params.id || 1

        // Cargar datos en paralelo
        await Promise.all([
          this.fetchPost(postId),
          this.fetchComments(postId)
        ])

        // Inicializar estado de likes
        this.likeCount = this.post.likes || 0
        this.isLiked = this.post.isLikedByUser || false

      } catch (error) {
        this.error = error.message
        console.error('Error initializing data:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPost(postId) {
      this.postLoading = true

      try {
        const response = await fetch(`/api/posts/${postId}`)

        if (!response.ok) {
          throw new Error('Error al cargar el post')
        }

        const data = await response.json()
        this.post = data
      } catch (error) {
        console.error('Error fetching post:', error)
        throw error
      } finally {
        this.postLoading = false
      }
    },

    async fetchComments(postId) {
      this.commentsLoading = true

      try {
        const response = await fetch(`/api/posts/${postId}/comments`)

        if (!response.ok) {
          throw new Error('Error al cargar los comentarios')
        }

        const data = await response.json()
        this.comments = data
      } catch (error) {
        console.error('Error fetching comments:', error)
        throw error
      } finally {
        this.commentsLoading = false
      }
    },

    // Función para toggle like
    async toggleLike() {
      const previousState = this.isLiked
      const previousCount = this.likeCount

      // Actualizar UI optimísticamente
      this.isLiked = !this.isLiked
      this.likeCount += this.isLiked ? 1 : -1

      try {
        const response = await fetch(`/api/posts/${this.post.id}/like`, {
          method: this.isLiked ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al actualizar el like')
        }

        const data = await response.json()
        // Actualizar con datos del servidor
        this.likeCount = data.likeCount
        this.isLiked = data.isLiked

      } catch (error) {
        console.error('Error toggling like:', error)
        // Revertir cambios en caso de error
        this.isLiked = previousState
        this.likeCount = previousCount
      }
    },

    // Función para agregar comentario
    async addComment() {
      if (this.newComment.trim()) {
        const commentContent = this.newComment.trim()
        this.newComment = ''

        try {
          const response = await fetch(`/api/posts/${this.post.id}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: commentContent
            })
          })

          if (!response.ok) {
            throw new Error('Error al enviar el comentario')
          }

          const newComment = await response.json()
          this.comments.push(newComment)

          // Actualizar contador de comentarios
          if (this.post.commentsCount !== undefined) {
            this.post.commentsCount += 1
          }

        } catch (error) {
          console.error('Error adding comment:', error)
          // Restaurar el comentario en caso de error
          this.newComment = commentContent
        }
      }
    },

    // Función para responder a un comentario
    async replyToComment(commentId, replyContent) {
      try {
        const response = await fetch(`/api/comments/${commentId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: replyContent
          })
        })

        if (!response.ok) {
          throw new Error('Error al enviar la respuesta')
        }

        const newReply = await response.json()

        // Encontrar el comentario y agregar la respuesta
        const comment = this.comments.find(c => c.id === commentId)
        if (comment) {
          if (!comment.replies) {
            comment.replies = []
          }
          comment.replies.push(newReply)
        }

      } catch (error) {
        console.error('Error replying to comment:', error)
      }
    },

    // Función para dar like a un comentario
    async toggleCommentLike(commentId) {
      try {
        const comment = this.comments.find(c => c.id === commentId)
        if (!comment) return

        const isLiked = comment.isLikedByUser || false

        const response = await fetch(`/api/comments/${commentId}/like`, {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al actualizar el like del comentario')
        }

        const data = await response.json()

        // Actualizar el comentario
        comment.likes = data.likeCount
        comment.isLikedByUser = data.isLiked

      } catch (error) {
        console.error('Error toggling comment like:', error)
      }
    },

    // Función para toggle mostrar comentarios
    toggleComments() {
      this.showComments = !this.showComments
    }
  }
}
</script>
<template>
  <div class="post-view">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="nav-left">
            <button class="back-btn">← Volver</button>
            <div class="logo">CreatorHub</div>
          </div>
          <div class="user-actions">
            <a href="#profile" class="btn btn-secondary">Mi Perfil</a>
            <a href="#settings" class="btn btn-primary">Configuración</a>
          </div>
        </nav>
      </div>
    </header>

    <!-- Post Content -->
    <main class="main-content">
      <div class="container">
        <!-- Post Header -->
        <div class="post-header">
          <div class="breadcrumb">
            <a href="#home">Inicio</a> /
            <a href="#creator">{{ post.author.name }}</a> /
            <span>{{ post.title }}</span>
          </div>

          <div class="post-meta">
            <div class="author-info">
              <div class="author-avatar">{{ post.author.avatar }}</div>
              <div class="author-details">
                <h3 class="author-name">{{ post.author.name }}</h3>
                <span class="author-tier">{{ post.author.tier }}</span>
              </div>
            </div>
            <div class="post-stats">
              <span class="publish-time">{{ post.publishedAt }}</span>
              <span class="category">{{ post.category }}</span>
            </div>
          </div>
        </div>

        <!-- Post Content -->
        <article class="post-content">
          <h1 class="post-title">{{ post.title }}</h1>

          <div class="post-tags">
            <span
                v-for="tag in post.tags"
                :key="tag"
                class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <div class="tier-badge">
            <span class="tier-icon">🔒</span>
            Contenido exclusivo para {{ post.tierRequired }}
          </div>

          <!-- Media Content -->
          <div class="media-container">
            <div class="video-player">
              <div class="video-thumbnail">
                <div class="play-icon">▶️</div>
                <span class="video-duration">{{ post.media.duration }}</span>
              </div>
              <div class="video-info">
                <h3>Tutorial Completo - Técnicas Avanzadas</h3>
                <p>Video en alta definición con recursos descargables</p>
              </div>
            </div>
          </div>

          <!-- Post Description -->
          <div class="post-description">
            <p>{{ post.content }}</p>

            <div class="post-details">
              <h3>¿Qué aprenderás?</h3>
              <ul>
                <li>Técnicas avanzadas de pincel y texturizado</li>
                <li>Manejo profesional de luces y sombras</li>
                <li>Composición y teoría del color aplicada</li>
                <li>Flujo de trabajo optimizado para proyectos grandes</li>
                <li>Recursos y pinceles personalizados (descarga incluida)</li>
              </ul>
            </div>

            <div class="post-resources">
              <h3>Recursos incluidos</h3>
              <div class="resource-list">
                <div class="resource-item">
                  <span class="resource-icon">📁</span>
                  <span>Pinceles personalizados (12 archivos)</span>
                  <button class="download-btn">Descargar</button>
                </div>
                <div class="resource-item">
                  <span class="resource-icon">🎨</span>
                  <span>Paletas de colores (PSD)</span>
                  <button class="download-btn">Descargar</button>
                </div>
                <div class="resource-item">
                  <span class="resource-icon">📄</span>
                  <span>Guía de referencia (PDF)</span>
                  <button class="download-btn">Descargar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Actions -->
          <div class="post-actions">
            <button
                @click="toggleLike"
                :class="['action-btn', 'like-btn', { active: isLiked }]"
            >
              <span class="action-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
              <span class="action-text">{{ likeCount }}</span>
            </button>

            <button class="action-btn share-btn">
              <span class="action-icon">🔗</span>
              <span class="action-text">Compartir</span>
            </button>

            <button class="action-btn bookmark-btn">
              <span class="action-icon">🔖</span>
              <span class="action-text">Guardar</span>
            </button>
          </div>
        </article>

        <!-- Comments Section -->
        <section class="comments-section">
          <div class="comments-header">
            <h2>Comentarios ({{ post.commentsCount }})</h2>
            <button
                @click="showComments = !showComments"
                class="toggle-comments"
            >
              {{ showComments ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <!-- Add Comment -->
          <div class="add-comment">
            <div class="comment-avatar">👤</div>
            <div class="comment-form">
              <textarea
                  v-model="newComment"
                  placeholder="Escribe un comentario..."
                  class="comment-input"
              ></textarea>
              <div class="comment-actions">
                <button @click="addComment" class="btn btn-primary">
                  Comentar
                </button>
              </div>
            </div>
          </div>

          <!-- Comments List -->
          <div v-if="showComments" class="comments-list">
            <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
            >
              <div class="comment-avatar">{{ comment.user.avatar }}</div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user.name }}</span>
                  <span
                      v-if="comment.user.isCreator"
                      class="creator-badge"
                  >
                    ✨ Creador
                  </span>
                  <span class="comment-tier">{{ comment.user.tier }}</span>
                  <span class="comment-time">{{ comment.timestamp }}</span>
                </div>

                <p class="comment-text">{{ comment.content }}</p>

                <div class="comment-actions">
                  <button class="comment-action-btn">
                    <span class="action-icon">🤍</span>
                    <span>{{ comment.likes }}</span>
                  </button>
                  <button class="comment-action-btn">
                    <span class="action-icon">💬</span>
                    <span>Responder</span>
                  </button>
                </div>

                <!-- Replies -->
                <div v-if="comment.replies.length > 0" class="replies">
                  <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item"
                  >
                    <div class="comment-avatar">{{ reply.user.avatar }}</div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">{{ reply.user.name }}</span>
                        <span
                            v-if="reply.user.isCreator"
                            class="creator-badge"
                        >
                          ✨ Creador
                        </span>
                        <span class="comment-tier">{{ reply.user.tier }}</span>
                        <span class="comment-time">{{ reply.timestamp }}</span>
                      </div>

                      <p class="comment-text">{{ reply.content }}</p>

                      <div class="comment-actions">
                        <button class="comment-action-btn">
                          <span class="action-icon">🤍</span>
                          <span>{{ reply.likes }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Related Posts -->
        <section class="related-posts">
          <h2>Más contenido de Ana García</h2>
          <div class="related-grid">
            <div class="related-item">
              <div class="related-thumbnail">🎨</div>
              <h3>Introducción al Arte Digital</h3>
              <span class="related-tier">Nivel Básico</span>
            </div>
            <div class="related-item">
              <div class="related-thumbnail">✨</div>
              <h3>Efectos Especiales en Photoshop</h3>
              <span class="related-tier">Nivel Artista</span>
            </div>
            <div class="related-item">
              <div class="related-thumbnail">🖼️</div>
              <h3>Portfolio Profesional</h3>
              <span class="related-tier">Nivel Pro</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.post-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
  color: #333;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: white;
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: #f0f0f0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #f8f9fa;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn:hover {
  transform: translateY(-2px);
}

/* Main Content */
.main-content {
  padding: 2rem 0;
}

/* Post Header */
.post-header {
  margin-bottom: 2rem;
}

.breadcrumb {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.author-tier {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

.post-stats {
  text-align: right;
  color: #666;
  font-size: 0.9rem;
}

.publish-time {
  display: block;
  margin-bottom: 0.2rem;
}

.category {
  background: #667eea;
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* Post Content */
.post-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.post-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.3;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  color: #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tier-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  font-weight: 600;
}

/* Media Container */
.media-container {
  margin: 2rem 0;
}

.video-player {
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
}

.video-thumbnail {
  height: 300px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.play-icon {
  font-size: 3rem;
  color: white;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

.video-info {
  padding: 1rem;
}

.video-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.video-info p {
  color: #666;
  font-size: 0.9rem;
}

/* Post Description */
.post-description {
  margin: 2rem 0;
}

.post-description p {
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #555;
}

.post-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.post-details h3 {
  margin-bottom: 1rem;
  color: #333;
}

.post-details ul {
  list-style: none;
  padding: 0;
}

.post-details li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  padding-left: 1.5rem;
}

.post-details li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.post-details li:last-child {
  border-bottom: none;
}

/* Resources */
.post-resources {
  margin: 2rem 0;
}

.post-resources h3 {
  margin-bottom: 1rem;
  color: #333;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.resource-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.resource-icon {
  font-size: 1.5rem;
}

.download-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.download-btn:hover {
  background: #5a6fd8;
}

/* Post Actions */
.post-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #e9ecef;
}

.like-btn.active {
  background: #ffe6e6;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.action-icon {
  font-size: 1.1rem;
}

/* Comments Section */
.comments-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.comments-header h2 {
  color: #333;
  font-size: 1.5rem;
}

.toggle-comments {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
}

/* Add Comment */
.add-comment {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.comment-form {
  flex: 1;
}

.comment-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  font-size: 0.9rem;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
}

.comment-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  color: #333;
}

.creator-badge {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.comment-tier {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
}

.comment-time {
  color: #999;
  font-size: 0.8rem;
  margin-left: auto;
}

.comment-text {
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.comment-action-btn:hover {
  background: #f0f0f0;
}

/* Replies */
.replies {
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #e0e0e0;
}

.reply-item {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.reply-item .comment-avatar {
  width: 32px;
  height: 32px;
  font-size: 1rem;
}

/* Related Posts */
.related-posts {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.related-posts h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.related-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.related-item:hover {
  transform: translateY(-2px);
}

.related-thumbnail {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.related-item h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.related-tier {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .post-title {
    font-size: 1.8rem;
  }

  .post-meta {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .post-actions {
    flex-direction: column;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-time {
    margin-left: 0;
  }
}
</style>