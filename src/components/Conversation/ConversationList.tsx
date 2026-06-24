import { useState, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { getUserConversations, getConversationMessages, deleteConversation } from '../../api/conversations';
import type { Conversation, Message } from '../../api/types';

export function ConversationList() {
  const [userId, setUserId] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const search = useCallback(async () => {
    const id = parseInt(userId, 10);
    if (!id || id <= 0) {
      enqueueSnackbar('请输入有效用户ID', { variant: 'warning' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getUserConversations(id);
      if (res.success) setConversations(res.data || []);
      else setError(res.message || '查询失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }, [userId, enqueueSnackbar]);

  const openMessages = async (conv: Conversation) => {
    setSelectedConv(conv);
    setMsgOpen(true);
    setMsgLoading(true);
    try {
      const res = await getConversationMessages(conv.conversation_id);
      if (res.success) setMessages(res.data || []);
      else setMessages([]);
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteConversation(deleteTarget.conversation_id);
      if (res.success) {
        enqueueSnackbar('删除成功', { variant: 'success' });
        search();
      } else {
        enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<Conversation>[] = [
    { key: 'conversation_id', label: '会话ID', width: '70px' },
    { key: 'book_title', label: '书籍' },
    {
      key: 'buyer_nick',
      label: '买方',
      render: (r) => `${r.buyer_nick} (${r.buyer_stu_id})`,
    },
    {
      key: 'seller_nick',
      label: '卖方',
      render: (r) => `${r.seller_nick} (${r.seller_stu_id})`,
    },
    { key: 'message_count', label: '消息数', width: '80px' },
    {
      key: 'last_content',
      label: '最后消息',
      render: (r) => (
        <Typography noWrap sx={{ maxWidth: 200 }}>{r.last_content || '-'}</Typography>
      ),
    },
    {
      key: 'last_time',
      label: '最后时间',
      render: (r) => r.last_time?.split('T')[0],
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>聊天记录管理</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          label="用户ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
          sx={{ width: 160 }}
        />
        <Button variant="contained" startIcon={<Search />} onClick={search} size="small">
          查询
        </Button>
      </Box>
      <DataTable
        columns={columns}
        data={conversations}
        loading={loading}
        error={error}
        onRefresh={search}
        emptyText="请输入用户ID查询"
        onEdit={(row) => openMessages(row)}
        onDelete={(row) => setDeleteTarget(row)}
      />
      {/* 消息详情弹窗 */}
      <Dialog open={msgOpen} onClose={() => setMsgOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedConv?.book_title} - 聊天记录
          <IconButton
            onClick={() => setMsgOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {msgLoading ? (
            <Typography color="text.secondary">加载中...</Typography>
          ) : messages.length === 0 ? (
            <Typography color="text.secondary">暂无消息</Typography>
          ) : (
            messages.map((m) => {
              const isBuyer = m.sender_id === selectedConv?.buyer_id;
              return (
                <Box
                  key={m.id}
                  sx={{
                    mb: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBuyer ? 'flex-start' : 'flex-end',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '75%',
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 2,
                      bgcolor: isBuyer ? '#e3f2fd' : '#f3e5f5',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {isBuyer ? selectedConv?.buyer_nick : selectedConv?.seller_nick}
                    </Typography>
                    <Typography variant="body2">{m.content}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3 }}>
                    {m.created_at?.split('T')[0]} {m.created_at?.slice(11, 19)}
                  </Typography>
                </Box>
              );
            })
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除该会话及其全部消息吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Box>
  );
}
