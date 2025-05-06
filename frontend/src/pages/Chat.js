import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, getConversation, sendMessage } from '../services/api';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, Divider } from '@mui/material';
import { toast } from 'react-toastify';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);
        console.log('Current user từ AuthContext:', user);
        const response = await getAllUsers();
        console.log('Danh sách người dùng từ API:', response.data);
        let filteredUsers;
        if (user.role === 'user') {
          filteredUsers = response.data.filter(u => u.role === 'admin' && u._id !== user._id);
        } else if (user.role === 'admin') {
          filteredUsers = response.data.filter(u => u._id !== user._id); // Admin thấy tất cả user
        }
        console.log('Danh sách người dùng sau khi lọc:', filteredUsers);
        setUsers(filteredUsers || []);
        if (filteredUsers.length === 0) {
          setError(`Không có ${user.role === 'user' ? 'quản trị viên' : 'người dùng'} nào để chat.`);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        setError(`Không thể tải danh sách ${user.role === 'user' ? 'quản trị viên' : 'người dùng'}: ${err.message}`);
        toast.error('Không thể tải danh sách để chat');
      } finally {
        setLoadingUsers(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchConversation = async () => {
      try {
        setLoadingMessages(true);
        const response = await getConversation(selectedUser._id);
        console.log('Danh sách tin nhắn từ API:', response.data);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Lỗi khi lấy cuộc trò chuyện:', err);
        setError(`Không thể tải cuộc trò chuyện: ${err.message}`);
        toast.error('Không thể tải cuộc trò chuyện');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000); // Polling mỗi 5 giây
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = { recipientId: selectedUser._id, content: newMessage };
      console.log('Gửi tin nhắn với dữ liệu:', messageData);
      await sendMessage(messageData);
      setNewMessage('');
      const response = await getConversation(selectedUser._id);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      setError(`Không thể gửi tin nhắn: ${err.message}`);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleSelectUser = (u) => {
    console.log('Người dùng được chọn:', u);
    setSelectedUser(u);
    setMessages([]); // Reset messages khi chọn user mới
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>Vui lòng đăng nhập để sử dụng chat.</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3, display: 'flex', gap: 3 }}>
      <Box sx={{ width: '30%', borderRight: '1px solid #ddd' }}>
        <Typography variant="h5" gutterBottom>
          Danh sách {user.role === 'user' ? 'quản trị viên' : 'người dùng'}
        </Typography>
        {loadingUsers ? (
          <CircularProgress />
        ) : users.length === 0 ? (
          <Typography>Không có {user.role === 'user' ? 'quản trị viên' : 'người dùng'} nào để chat.</Typography>
        ) : (
          <List>
            {users.map((u) => (
              <ListItem
                key={u._id}
                onClick={() => handleSelectUser(u)}
                selected={selectedUser?._id === u._id}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText primary={u.username} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box sx={{ width: '70%' }}>
        {selectedUser ? (
          <>
            <Typography variant="h5" gutterBottom>Chat với {selectedUser.username}</Typography>
            <Box sx={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', p: 2, mb: 2 }}>
              {loadingMessages ? (
                <CircularProgress />
              ) : messages.length === 0 ? (
                <Typography>Chưa có tin nhắn nào.</Typography>
              ) : (
                messages.map((msg, index) => (
                  <Box key={index}>
                    <Box sx={{ mb: 1, textAlign: msg.senderId._id === user._id ? 'right' : 'left' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: msg.senderId.role === 'admin' ? 'green' : 'gray' }}>
                        {msg.senderId.username} ({msg.senderId.role === 'admin' ? 'Quản trị viên' : 'Người dùng'})
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          p: 1,
                          borderRadius: 2,
                          bgcolor: msg.senderId._id === user._id ? '#1976d2' : '#e0e0e0',
                          color: msg.senderId._id === user._id ? 'white' : 'black',
                        }}
                      >
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    {index < messages.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={handleSendMessage}>Gửi</Button>
            </Box>
          </>
        ) : (
          <Typography>Chọn một {user.role === 'user' ? 'quản trị viên' : 'người dùng'} để bắt đầu chat.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Chat;