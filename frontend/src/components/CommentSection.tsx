import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material';
import { Delete, Send } from '@mui/icons-material';
import { Comment } from '../types';
import commentService from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CommentSectionProps {
  articleId: number;
  comments: Comment[];
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  comments = [],
  onCommentAdded,
  onCommentDeleted,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, canModerateContent } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await commentService.createComment({
        article: articleId,
        content: newComment.trim(),
      });
      setNewComment('');
      onCommentAdded();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось добавить комментарий');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        await commentService.deleteComment(commentId, articleId);
        onCommentDeleted();
      } catch (err: any) {
        console.error('Delete comment error:', err);
        alert(err.response?.data?.detail || 'Не удалось удалить комментарий');
      }
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return comment.author.id === user.id || canModerateContent;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Комментарии ({comments.length})
      </Typography>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              error={!!error}
              helperText={error}
            />
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<Send />}
                disabled={loading || !newComment.trim()}
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Button onClick={() => navigate('/login')}>Войдите</Button>, чтобы оставить комментарий
        </Alert>
      )}

      {/* Comments List */}
      {!Array.isArray(comments) || comments.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          Пока нет комментариев. Будьте первым!
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Paper key={comment.id} elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" gap={2}>
                <Avatar src={comment.author?.avatar_url || undefined}>
                  {comment.author?.full_name?.[0] || 'A'}
                </Avatar>
                <Box flexGrow={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {comment.author?.full_name || 'Аноним'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(comment.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </Typography>
                    </Box>
                    {canDeleteComment(comment) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;
