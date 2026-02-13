'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase, type Bookmark } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBookmarks()
      subscribeToBookmarks()
    } else {
      setBookmarks([])
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user])

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data || [])
    }
  }

  const subscribeToBookmarks = () => {
    // Remove existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Create new channel with broadcast for faster updates
    const channel = supabase
      .channel('bookmarks-realtime', {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('INSERT received:', payload)
          setBookmarks((prev) => {
            const exists = prev.some(b => b.id === payload.new.id)
            if (exists) return prev
            return [payload.new as Bookmark, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('DELETE received:', payload)
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected successfully')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime connection error:', err)
        }
        if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime connection timed out')
        }
      })

    channelRef.current = channel
  }

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) return

    setLoading(true)
    
    // Create temporary bookmark with temporary ID for instant UI update
    const tempId = 'temp-' + Date.now()
    const tempBookmark: Bookmark = {
      id: tempId,
      user_id: user?.id || '',
      url,
      title,
      created_at: new Date().toISOString(),
    }
    
    // Optimistically add to UI immediately
    setBookmarks((prev) => [tempBookmark, ...prev])
    
    // Clear form immediately for better UX
    const savedUrl = url
    const savedTitle = title
    setUrl('')
    setTitle('')

    const { data, error } = await supabase.from('bookmarks').insert([
      {
        url: savedUrl,
        title: savedTitle,
        user_id: user?.id,
      },
    ]).select()

    if (error) {
      console.error('Error adding bookmark:', error)
      alert('Error adding bookmark: ' + error.message)
      // Remove temp bookmark and restore form on error
      setBookmarks((prev) => prev.filter((b) => b.id !== tempId))
      setUrl(savedUrl)
      setTitle(savedTitle)
    } else if (data && data[0]) {
      // Replace temp bookmark with real one from database
      setBookmarks((prev) => 
        prev.map((b) => b.id === tempId ? data[0] : b)
      )
      console.log('✅ Bookmark added, realtime event should fire')
    }
    
    setLoading(false)
  }

  const deleteBookmark = async (id: string) => {
    // Optimistic update - remove immediately from UI
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Error deleting bookmark: ' + error.message)
      // Refetch on error to restore the bookmark
      fetchBookmarks()
    } else {
      console.log('✅ Bookmark deleted, realtime event should fire')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Smart Bookmark App
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onlyThirdPartyProviders
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Bookmarks</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <form onSubmit={addBookmark} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome bookmark"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Bookmark'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No bookmarks yet. Add your first one above!
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {bookmark.title}
                  </h3>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm break-all"
                  >
                    {bookmark.url}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(bookmark.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}