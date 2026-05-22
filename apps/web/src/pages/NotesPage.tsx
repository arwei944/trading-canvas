import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Note,
} from '@mui/icons-material';

interface NoteItem {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createTime: number;
  updateTime: number;
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

/**
 * 笔记页面
 */
export function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 1,
      title: 'BTC突破关键阻力位',
      content: '今天BTC突破了50000美元的关键阻力位，成交量明显放大。预计短期内可能继续上涨，但需要注意回调风险。',
      tags: ['突破', 'BTC'],
      createTime: Date.now() - 86400000,
      updateTime: Date.now() - 86400000,
    },
    {
      id: 2,
      title: '止损离场记录',
      content: 'ETH做空止损，亏损2%。下次需要更加注意止损位的设置。',
      tags: ['止损', 'ETH'],
      createTime: Date.now() - 172800000,
      updateTime: Date.now() - 172800000,
    },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<NoteItem | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

  const handleOpenDialog = (note?: NoteItem) => {
    if (note) {
      setEditNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags.join(', '),
      });
    } else {
      setEditNote(null);
      setFormData({ title: '', content: '', tags: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditNote(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) return;

    const tagList = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);

    if (editNote) {
      setNotes(notes.map(n => 
        n.id === editNote.id 
          ? { 
              ...n, 
              title: formData.title, 
              content: formData.content, 
              tags: tagList,
              updateTime: Date.now(),
            }
          : n
      ));
    } else {
      const newNote: NoteItem = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
        tags: tagList,
        createTime: Date.now(),
        updateTime: Date.now(),
      };
      setNotes([newNote, ...notes]);
    }

    handleCloseDialog();
  };

  const handleDelete = (noteId: number) => {
    if (window.confirm('确定要删除这篇笔记吗？')) {
      setNotes(notes.filter(n => n.id !== noteId));
    }
  };

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
                    {note.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {formatTime(note.updateTime)}
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
              <TextField
                fullWidth
                label="标签"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="多个标签用逗号分隔，例如：突破,BTC"
                helperText="多个标签用逗号分隔"
              />
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
