import { useState, useEffect, useRef } from 'react';
import { Plus, Search, X, Link2, Trash2, Edit3, Bookmark, Sun, Moon, Tags, LogOut } from 'lucide-react';
import { supabase } from './supabase';
import type { URLItem } from './types';
import type { User } from '@supabase/supabase-js';
import './App.css';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('linkr-theme');
      return (stored === 'light' || stored === 'dark') ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('linkr-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .filter((tag, index, self) => self.indexOf(tag) === index);
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, title: string | undefined, tags: string[]) => void;
  initialUrl?: string;
  initialTitle?: string;
  initialTags?: string[];
}

function Modal({ isOpen, onClose, onSave, initialUrl = '', initialTitle = '', initialTags = [] }: ModalProps) {
  const [url, setUrl] = useState(() => initialUrl);
  const [title, setTitle] = useState(() => initialTitle);
  const [tagsInput, setTagsInput] = useState(() => initialTags.join(', '));
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isOpen) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        setUrl(initialUrl);
        setTitle(initialTitle);
        setTagsInput(initialTags.join(', '));
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      isFirstRender.current = true;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim()) return;
    const tags = parseTags(tagsInput);
    const titleValue = title.trim() || undefined;
    onSave(url.trim(), titleValue, tags);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initialUrl ? 'Edit Link' : 'Add New Link'}</h2>
        <div className="form-group">
          <label htmlFor="url-input">URL</label>
          <input
            id="url-input"
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="title-input">Title <span className="optional">(optional)</span></label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Leave empty to auto-fetch from URL"
          />
          <span className="hint">If empty, the first tag will be used as the title</span>
        </div>
        <div className="form-group">
          <label htmlFor="tags-input">Tags (comma-separated)</label>
          <input
            id="tags-input"
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="react, typescript, frontend"
          />
          <span className="hint">Separate tags with commas</span>
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!url.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Linkr</h1>
        <p className="login-subtitle">Your personal link manager</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          {message && <p className="message">{message}</p>}
          
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <button 
          className="toggle-auth-btn"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage('');
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<URLItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<URLItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchItems();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchItems();
      } else {
        setItems([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setItems([]);
    setSelectedTags([]);
  };

  const handleAddItem = async (url: string, title: string | undefined, tags: string[]) => {
    const finalTitle = title || (tags.length > 0 ? tags[0] : undefined);

    try {
      const { data, error } = await supabase
        .from('urls')
        .insert({ url, title: finalTitle, tags })
        .select()
        .single();
      
      if (error) throw error;
      setItems([data, ...items]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = async (url: string, title: string | undefined, tags: string[]) => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('urls')
        .update({ url, title, tags })
        .eq('id', editingItem.id);
      
      if (error) throw error;
      
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, url, title, tags } : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('urls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearSearch = () => {
    setSelectedTags([]);
  };

  const allTags = [...new Set(items.flatMap(item => item.tags))].sort();

  const filteredItems = items.filter(item => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tag => item.tags.includes(tag));
  });

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Linkr</h1>
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by tags..."
            value={selectedTags.join(', ')}
            readOnly
            className="search-input"
          />
          {selectedTags.length > 0 && (
            <button className="clear-btn" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={24} />
        </button>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="signout-btn" onClick={handleSignOut} title="Sign out">
          <LogOut size={20} />
        </button>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <Tags size={18} />
            <span>Tags</span>
          </div>
          {allTags.length === 0 ? (
            <p className="sidebar-empty">No tags yet</p>
          ) : (
            <div className="sidebar-tags">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`sidebar-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          {selectedTags.length > 0 && (
            <button className="clear-all-btn" onClick={clearSearch}>
              Clear all
            </button>
          )}
        </aside>

        <main className="main">
          {items.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={48} strokeWidth={1.5} />
              <h2>No URLs saved yet</h2>
              <p>Click + to add your first link</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <Search size={48} strokeWidth={1.5} />
              <h2>No URLs match your search</h2>
              <p>Try a different tag or clear your search</p>
            </div>
          ) : (
            <div className="url-list">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`url-card ${mounted ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="card-content">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="card-title"
                      title={item.title || item.url}
                    >
                      {item.title || item.url}
                    </a>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="card-url"
                      title={item.url}
                    >
                      <Link2 size={12} className="url-icon" />
                      {item.url}
                    </a>
                    {item.tags.length > 0 && (
                      <div className="tags">
                        {item.tags.map(tag => (
                          <button
                            key={tag}
                            className="tag"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="action-btn"
                      onClick={() => setEditingItem(item)}
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddItem}
      />

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleEditItem}
        initialUrl={editingItem?.url}
        initialTitle={editingItem?.title}
        initialTags={editingItem?.tags}
      />
    </div>
  );
}

export default App;
