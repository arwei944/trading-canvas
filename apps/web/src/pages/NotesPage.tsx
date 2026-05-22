import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Note,
} from '@mui/icons-material';
import { useNoteStore } from '@trading.canvas/core';
import type { Note as NoteType, TradeTag } from '@trading.canvas/core';

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

/**
 * 笔记页面
 */
export function NotesPage() {
  const notes = useNoteStore(s => s.notes);
  const tags = useNoteStore(s => s.tags);
  const isLoading = useNoteStore(s => s.isLoading);
  const fetchNotes = useNoteStore(s => s.fetchNotes);
  const fetchTags = useNoteStore(s => s.fetchTags);
  const addNote = useNoteStore(s => s.addNote);
  const updateNote = useNoteStore(s => s.updateNote);
  const deleteNote = useNoteStore(s => s.deleteNote);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<NoteType | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  const handleOpenDialog = (note?: NoteType) => {
    if (note) {
      setEditNote(note);
      setFormData({
        title: note.title,
        content: note.content,
      });
      setSelectedTagIds((note.tags || []).map(t => t.id));
    } else {
      setEditNote(null);
      setFormData({ title: '', content: '' });
      setSelectedTagIds([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditNote(null);
  };

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return;

    if (editNote) {
      await updateNote(editNote.id, {
        title: formData.title,
        content: formData.content,
        tagIds: selectedTagIds,
      });
    } else {
      await addNote({
        title: formData.title,
        content: formData.content,
        tagIds: selectedTagIds,
      });
    }

    handleCloseDialog();
  };

  const handleDelete = async (noteId: number) => {
    if (window.confirm('确定要删除这篇笔记吗？')) {
      await deleteNote(noteId);
    }
  };

  if (isLoading && notes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          交易笔记
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加笔记
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {notes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Note sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                暂无笔记，点击上方添加
              </Typography>
            </Box>
          ) : (
            <List>
              {notes.map((note) => (
                <ListItem
                  key={note.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {note.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {note.content.slice(0, 100)}
                          {note.content.length > 100 ? '...' : ''}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleOpenDialog(note)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(note.id)} color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {(note.tags || []).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                      />
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {formatTime(note.updatedAt)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editNote ? '编辑笔记' : '添加笔记'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入笔记标题"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="内容"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入笔记内容"
                multiline
                rows={6}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                选择标签
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {tags.length === 0 && (
                  <Typography variant="caption" color="text.disabled">
                    暂无标签，请先在标签管理中添加
                  </Typography>
                )}
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => handleToggleTag(tag.id)}
                      sx={{
                        borderColor: tag.color,
                        color: isSelected ? '#fff' : tag.color,
                        backgroundColor: isSelected ? tag.color : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.content}
          >
            {editNote ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
