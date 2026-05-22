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
  LocalOffer,
} from '@mui/icons-material';
import { useNoteStore } from '@trading.canvas/core';
import type { TradeTag } from '@trading.canvas/core';
import { useToast } from '../components/Toast';

/**
 * 标签管理页面
 */
export function TagsPage() {
  const { showToast } = useToast();
  const tags = useNoteStore(s => s.tags);
  const isLoading = useNoteStore(s => s.isLoading);
  const fetchTags = useNoteStore(s => s.fetchTags);
  const addTag = useNoteStore(s => s.addTag);
  const updateTag = useNoteStore(s => s.updateTag);
  const deleteTag = useNoteStore(s => s.deleteTag);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTag, setEditTag] = useState<TradeTag | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#5470c6' });

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenDialog = (tag?: TradeTag) => {
    if (tag) {
      setEditTag(tag);
      setFormData({ name: tag.name, color: tag.color });
    } else {
      setEditTag(null);
      setFormData({ name: '', color: '#5470c6' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditTag(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    try {
      if (editTag) {
        await updateTag(editTag.id, { name: formData.name, color: formData.color });
        showToast('标签更新成功', 'success');
      } else {
        await addTag({ name: formData.name, color: formData.color });
        showToast('标签添加成功', 'success');
      }

      handleCloseDialog();
    } catch (error: any) {
      showToast('操作失败: ' + error.message, 'error');
    }
  };

  const handleDelete = async (tagId: number) => {
    if (window.confirm('确定要删除这个标签吗？')) {
      try {
        await deleteTag(tagId);
        showToast('标签已删除', 'success');
      } catch (error: any) {
        showToast('操作失败: ' + error.message, 'error');
      }
    }
  };

  if (isLoading && tags.length === 0) {
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
          标签管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加标签
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {tags.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LocalOffer sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                暂无标签，点击上方添加
              </Typography>
            </Box>
          ) : (
            <List>
              {tags.map((tag) => (
                <ListItem
                  key={tag.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: tag.color,
                      mr: 2,
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {tag.name}
                      </Typography>
                    }
                    secondary={`使用 ${tag.noteCount ?? 0} 次`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenDialog(tag)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(tag.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editTag ? '编辑标签' : '添加标签'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="标签名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入标签名称"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: 60,
                    height: 40,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
                <TextField
                  fullWidth
                  label="颜色代码"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            {editTag ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 快捷颜色选择 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            常用颜色
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'].map(color => (
              <Box
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: formData.color === color ? '2px solid #fff' : 'none',
                  boxShadow: formData.color === color ? '0 0 0 2px #000' : 'none',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
