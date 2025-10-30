import React, { useState, useEffect } from 'react';
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
import { colors, spacing, typography } from '../theme/designTokens';
import { Headline, BodyText, Caption } from './ui/Typography';

interface CommentSectionNewProps {
  articleId: number;
}

const CommentSectionNew: React.FC<CommentSectionNewProps> = ({ articleId }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, canModerateContent } = useAuth();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    console.log('CommentSectionNew: Loading comments for article', articleId);
    setLoadingComments(true);
    try {
      const data = await commentService.getComments(articleId);
      console.log('CommentSectionNew: Raw response:', data);
      console.log('CommentSectionNew: Is array?', Array.isArray(data));
      console.log('CommentSectionNew: Number of comments:', data?.length || 0);
      console.log('CommentSectionNew: First comment:', data?.[0]);
      setComments(data);
    } catch (err) {
      console.error('CommentSectionNew: Failed to load comments:', err);
      console.error('CommentSectionNew: Error details:', err);
    } finally {
      setLoadingComments(false);
      console.log('CommentSectionNew: Loading finished, loadingComments set to false');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CommentSectionNew: Submit clicked');
    console.log('CommentSectionNew: Is authenticated:', isAuthenticated);
    console.log('CommentSectionNew: Article ID:', articleId);
    console.log('CommentSectionNew: Comment content:', newComment);
    
    if (!isAuthenticated) {
      console.log('CommentSectionNew: Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      console.log('CommentSectionNew: Comment is empty');
      setError('Комментарий не может быть пустым');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('CommentSectionNew: Calling commentService.createComment');
      const result = await commentService.createComment({
        article: articleId,
        content: newComment,
      });
      console.log('CommentSectionNew: Comment created successfully:', result);
      setNewComment('');
      await loadComments();
    } catch (err: any) {
      console.error('CommentSectionNew: Error creating comment:', err);
      console.error('CommentSectionNew: Error response:', err.response);
      setError(err.response?.data?.detail || 'Не удалось добавить комментарий');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      await commentService.deleteComment(articleId, commentId);
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const canDelete = canModerateContent || comment.author?.id === user?.id;

    const commentStyles: React.CSSProperties = {
      marginLeft: depth > 0 ? spacing[8] : 0,
      padding: spacing[4],
      borderBottom: `1px solid ${colors.border.light}`,
    };

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      marginBottom: spacing[2],
    };

    return (
      <div key={comment.id} style={commentStyles}>
        <div style={headerStyles}>
          <Avatar 
            src={comment.author?.avatar_url || undefined} 
            alt={comment.author?.username}
            sx={{ width: 32, height: 32 }}
          />
          <div style={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.author?.full_name || comment.author?.username || 'Аноним'}
            </Typography>
            <Caption>
              {format(new Date(comment.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </Caption>
          </div>
          {canDelete && (
            <IconButton
              size="small"
              onClick={() => handleDelete(comment.id)}
              sx={{ color: colors.text.tertiary }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </div>
        <BodyText style={{ marginLeft: spacing[8] }}>
          {comment.content}
        </BodyText>
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: spacing[4] }}>
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const sectionStyles: React.CSSProperties = {
    marginTop: spacing[12],
  };

  const formStyles: React.CSSProperties = {
    marginBottom: spacing[8],
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
  };

  console.log('CommentSectionNew: Rendering with', comments.length, 'comments');
  console.log('CommentSectionNew: loadingComments:', loadingComments);
  
  return (
    <div style={sectionStyles}>
      <div style={{ marginBottom: spacing[6] }}>
        <Headline level={3}>
          Комментарии {comments.length > 0 && `(${comments.length})`}
        </Headline>
      </div>

      {isAuthenticated ? (
        <div style={formStyles}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ marginBottom: spacing[3] }}
            />
            {error && (
              <Alert severity="error" sx={{ marginBottom: spacing[2] }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              endIcon={<Send />}
              sx={{ 
                backgroundColor: colors.brand.red,
                '&:hover': { backgroundColor: colors.brand.redHover }
              }}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </Button>
          </form>
        </div>
      ) : (
        <Alert severity="info" sx={{ marginBottom: spacing[6] }}>
          <Typography>
            Войдите, чтобы оставить комментарий.{' '}
            <Button onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
              Войти
            </Button>
          </Typography>
        </Alert>
      )}

      {(() => {
        console.log('CommentSectionNew: Render check - loadingComments:', loadingComments);
        console.log('CommentSectionNew: Render check - comments.length:', comments.length);
        console.log('CommentSectionNew: Render check - comments:', comments);
        
        if (loadingComments) {
          return <Typography>Загрузка комментариев...</Typography>;
        }
        
        if (!Array.isArray(comments) || comments.length === 0) {
          return <Alert severity="info">Комментариев пока нет. Будьте первым!</Alert>;
        }
        
        return (
          <div style={{ border: `1px solid ${colors.border.light}` }}>
            {comments.map((comment) => renderComment(comment))}
          </div>
        );
      })()}
    </div>
  );
};

export default CommentSectionNew;
