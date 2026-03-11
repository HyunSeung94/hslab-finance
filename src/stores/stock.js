import { defineStore } from 'pinia'
import api from '../api'

export const useStockStore = defineStore('stock', {
  state: () => ({
    watchlist: [],
    currentStock: null,
    predictions: [],
    loading: false,
    lastUpdated: null
  }),

  getters: {
    getStockBySymbol: (state) => (symbol) => {
      return state.watchlist.find(s => s.symbol === symbol)
    },

    predictionStats: (state) => {
      const total = state.predictions.filter(p => p.actualResult !== null && p.actualResult !== undefined).length
      const correct = state.predictions.filter(p => p.isCorrect).length
      const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0
      return { total: state.predictions.length, evaluated: total, correct, accuracy }
    }
  },

  actions: {
    async fetchWatchlist() {
      this.loading = true
      try {
        const { data } = await api.get('/watchlist')
        this.watchlist = data.watchlist || data
        // 각 종목 시세 조회
        await Promise.all(
          this.watchlist.map(stock => this.fetchStockPrice(stock.symbol))
        )
      } catch (error) {
        console.error('Failed to fetch watchlist:', error)
      } finally {
        this.loading = false
      }
    },

    async addStock(symbol, name = '') {
      try {
        const { data } = await api.post('/watchlist', { symbol, name })
        this.watchlist.push(data)
        // 추가 후 바로 시세 조회
        await this.fetchStockPrice(symbol)
        return data
      } catch (error) {
        console.error('Failed to add stock:', error)
        throw error
      }
    },

    async removeStock(symbol) {
      try {
        const stock = this.watchlist.find(s => s.symbol === symbol)
        if (stock?.id) {
          await api.delete(`/watchlist/${stock.id}`)
        }
        this.watchlist = this.watchlist.filter(s => s.symbol !== symbol)
      } catch (error) {
        console.error('Failed to remove stock:', error)
        throw error
      }
    },

    async fetchStockPrice(symbol) {
      try {
        const { data } = await api.get(`/stocks/price/${symbol}`)
        this.currentStock = data
        this.lastUpdated = new Date().toISOString()

        const idx = this.watchlist.findIndex(s => s.symbol === symbol)
        if (idx !== -1) {
          this.watchlist[idx] = { ...this.watchlist[idx], ...data }
        }

        return data
      } catch (error) {
        console.error('Failed to fetch stock price:', error)
        throw error
      }
    },

    async fetchStockHistory(symbol) {
      try {
        const { data } = await api.get('/stocks/history/' + symbol)
        return data
      } catch (error) {
        console.error('Failed to fetch stock history:', error)
        throw error
      }
    },

    async fetchPredictions(symbol = null) {
      this.loading = true
      try {
        const params = symbol ? { symbol } : {}
        const { data } = await api.get('/predictions', { params })
        this.predictions = data
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      } finally {
        this.loading = false
      }
    },

    async createPrediction(prediction) {
      try {
        const { data } = await api.post('/predictions', prediction)
        this.predictions.unshift(data)
        return data
      } catch (error) {
        console.error('Failed to create prediction:', error)
        throw error
      }
    }
  }
})
