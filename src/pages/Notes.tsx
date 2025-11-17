import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Trash2, Star, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTag, setNewTag] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar notas');
      console.error(error);
    } else {
      setNotes(data || []);
    }
  };

  const createNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setTags([]);
    setIsFavorite(false);
    setIsEditing(true);
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsFavorite(note.is_favorite);
    setIsEditing(false);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    const noteData = {
      title,
      content,
      tags,
      is_favorite: isFavorite,
      user_id: user?.id,
    };

    if (selectedNote) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', selectedNote.id);

      if (error) {
        toast.error('Error al actualizar nota');
        console.error(error);
      } else {
        toast.success('Nota actualizada');
        fetchNotes();
        setIsEditing(false);
      }
    } else {
      // Create new note
      const { error } = await supabase
        .from('notes')
        .insert([noteData]);

      if (error) {
        toast.error('Error al crear nota');
        console.error(error);
      } else {
        toast.success('Nota creada');
        fetchNotes();
        setIsEditing(false);
      }
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar nota');
      console.error(error);
    } else {
      toast.success('Nota eliminada');
      fetchNotes();
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setTags([]);
        setIsFavorite(false);
      }
    }
  };

  const toggleFavorite = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_favorite: !note.is_favorite })
      .eq('id', note.id);

    if (error) {
      toast.error('Error al actualizar favorito');
    } else {
      fetchNotes();
      if (selectedNote?.id === note.id) {
        setIsFavorite(!note.is_favorite);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">📝 Mis Notas</h1>
          <Button onClick={createNewNote} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Nota
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with notes list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar notas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay notas
                  </p>
                ) : (
                  filteredNotes.map(note => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedNote?.id === note.id
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => selectNote(note)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {note.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {note.content || 'Sin contenido'}
                          </p>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(note);
                          }}
                          className="shrink-0"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              note.is_favorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.updated_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {isEditing
                    ? selectedNote
                      ? 'Editar Nota'
                      : 'Nueva Nota'
                    : 'Vista de Nota'}
                </CardTitle>
                <div className="flex gap-2">
                  {selectedNote && !isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNote(selectedNote.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          if (selectedNote) {
                            selectNote(selectedNote);
                          } else {
                            setTitle('');
                            setContent('');
                            setTags([]);
                            setIsFavorite(false);
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={saveNote} className="gap-2">
                        <Save className="w-4 h-4" />
                        Guardar
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing || selectedNote ? (
                  <>
                    <div>
                      <Input
                        placeholder="Título de la nota..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={!isEditing}
                        className="text-xl font-bold"
                      />
                    </div>

                    <div>
                      <Textarea
                        placeholder="Escribe aquí el contenido de tu nota... Puedes guardar información importante del chatbot, métricas, acciones pendientes, etc."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={!isEditing}
                        className="min-h-[400px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Etiquetas
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            {isEditing && (
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar etiqueta..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          />
                          <Button variant="outline" onClick={addTag}>
                            Agregar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => isEditing && setIsFavorite(!isFavorite)}
                        disabled={!isEditing}
                        className="flex items-center gap-2"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFavorite
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-sm">
                          {isFavorite ? 'Marcado como favorito' : 'Marcar como favorito'}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">Selecciona una nota o crea una nueva</p>
                    <p className="text-sm mt-2">
                      Guarda información importante del chatbot para revisarla después
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;