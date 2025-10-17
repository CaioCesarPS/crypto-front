/**
 * Integration tests for /api/favorites endpoint
 * Tests GET, POST, DELETE operations with Supabase
 */

import { GET, POST, DELETE } from '@/app/api/favorites/route'
import { supabase } from '@/lib/supabase'
import { createTestRequest } from '../../helpers/request-helpers'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('/api/favorites Integration Tests', () => {
  const mockFavorites = [
    {
      id: '1',
      asset_id: 'bitcoin',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      asset_id: 'ethereum',
      created_at: '2024-01-02T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/favorites', () => {
    it('should fetch all favorites successfully', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockFavorites,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.favorites).toEqual(mockFavorites)
      expect(supabase.from).toHaveBeenCalledWith('favorites')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array when no favorites exist', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.favorites).toEqual([])
    })

    it('should return 500 when database query fails', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch favorites')
    })

    it('should order favorites by created_at descending', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockFavorites,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      await GET()

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('POST /api/favorites', () => {
    it('should add a new favorite successfully', async () => {
      const newFavorite = {
        id: '3',
        asset_id: 'cardano',
        created_at: '2024-01-03T00:00:00Z',
      }

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: newFavorite,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ asset_id: 'cardano' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.favorite).toEqual(newFavorite)
      expect(mockInsert).toHaveBeenCalledWith({ asset_id: 'cardano' })
    })

    it('should return 400 when asset_id is missing', async () => {
      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('asset_id is required')
    })

    it('should handle duplicate favorites gracefully', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ asset_id: 'bitcoin' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Asset already in favorites')
    })

    it('should return 500 when database insert fails', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'DB_ERROR', message: 'Database error' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ asset_id: 'ethereum' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to add favorite')
    })

    it('should handle malformed JSON request body', async () => {
      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to add favorite')
    })
  })

  describe('DELETE /api/favorites', () => {
    it('should delete a favorite successfully', async () => {
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/favorites?asset_id=bitcoin',
        { method: 'DELETE' }
      )

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Favorite removed successfully')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('asset_id', 'bitcoin')
    })

    it('should return 400 when asset_id is missing', async () => {
      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('asset_id is required')
    })

    it('should return 500 when database delete fails', async () => {
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/favorites?asset_id=ethereum',
        { method: 'DELETE' }
      )

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to remove favorite')
    })

    it('should handle deleting non-existent favorite', async () => {
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/favorites?asset_id=nonexistent',
        { method: 'DELETE' }
      )

      const response = await DELETE(request)
      const data = await response.json()

      // Should still return success even if nothing was deleted
      expect(response.status).toBe(200)
      expect(data.message).toBe('Favorite removed successfully')
    })
  })

  describe('Data Validation', () => {
    it('should validate asset_id format in POST', async () => {
      const request = createTestRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ asset_id: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('asset_id is required')
    })

    it('should handle special characters in asset_id for DELETE', async () => {
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/favorites?asset_id=asset-with-dashes',
        { method: 'DELETE' }
      )

      const response = await DELETE(request)

      expect(response.status).toBe(200)
      expect(mockEq).toHaveBeenCalledWith('asset_id', 'asset-with-dashes')
    })
  })

  describe('CRUD Operations Flow', () => {
    it('should handle complete flow: add, list, remove', async () => {
      // 1. Add favorite
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelectInsert = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockFavorites[0],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelectInsert,
      })

      mockSelectInsert.mockReturnValue({
        single: mockSingle,
      })

      const postRequest = createTestRequest(
        'http://localhost:3000/api/favorites',
        {
          method: 'POST',
          body: JSON.stringify({ asset_id: 'bitcoin' }),
        }
      )

      const postResponse = await POST(postRequest)
      expect(postResponse.status).toBe(201)

      // 2. List favorites
      const mockSelectGet = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockFavorites[0]],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelectGet,
      })

      mockSelectGet.mockReturnValue({
        order: mockOrder,
      })

      const getResponse = await GET()
      const getData = await getResponse.json()
      expect(getData.favorites).toHaveLength(1)

      // 3. Remove favorite
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const deleteRequest = createTestRequest(
        'http://localhost:3000/api/favorites?asset_id=bitcoin',
        { method: 'DELETE' }
      )

      const deleteResponse = await DELETE(deleteRequest)
      expect(deleteResponse.status).toBe(200)
    })
  })
})
