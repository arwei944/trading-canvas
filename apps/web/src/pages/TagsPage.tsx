import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNoteStore } from '@trading.canvas/core';
import type { TradeTag } from '@trading.canvas/core';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';

/**
 * 标签管理页面
 */
export function TagsPage() {
  const { t } = useTranslation();
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
        showToast(t('tags.tagUpdated'), 'success');
      } else {
        await addTag({ name: formData.name, color: formData.color });
        showToast(t('tags.tagAdded'), 'success');
      }

      handleCloseDialog();
    } catch (error: any) {
      showToast(t('common.operationFailed') + ': ' + error.message, 'error');
    }
  };

  const handleDelete = async (tagId: number) => {
    if (window.confirm(t('tags.confirmDelete'))) {
      try {
        await deleteTag(tagId);
        showToast(t('tags.tagDeleted'), 'success');
      } catch (error: any) {
        showToast(t('common.operationFailed') + ': ' + error.message, 'error');
      }
    }
  };

  if (isLoading && tags.length === 0) {
    return <ListSkeleton />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('tags.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('tags.add')}
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {tags.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LocalOffer sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                {t('tags.noTags')}
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
                    secondary={t('tags.count', { count: tag.noteCount ?? 0 })}
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
          {editTag ? t('tags.edit') : t('tags.add')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('tags.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('tags.name')}
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
                  label={t('tags.colorCode')}
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            {editTag ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 快捷颜色选择 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('tags.commonColors')}
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
