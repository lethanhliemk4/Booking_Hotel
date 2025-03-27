import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, getConversation, sendMessage } from '../services/api';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, Divider } from '@mui/material'; // Re-add Divider
import { toast } from 'react-toastify';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch all users to chat with
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await getAllUsers();
        // Filter out the current user
        const otherUsers = response.data.filter(u => u._id !== user._id);
        setUsers(otherUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast.error('Failed to load users for chat');
      } finally {
        setLoadingUsers(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // Fetch conversation when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchConversation = async () => {
      try {
        setLoadingMessages(true);
        const response = await getConversation(selectedUser._id);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        toast.error('Failed to load conversation');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchConversation();

    // Set up polling for new messages (simulating real-time chat)
    const interval = setInterval(fetchConversation, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Clean up on unmount or user change
  }, [selectedUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        recipientId: selectedUser._id,
        content: newMessage,
      };
      await sendMessage(messageData);
      setNewMessage('');
      // Refresh conversation
      const response = await getConversation(selectedUser._id);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>Please log in to use the chat.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3, display: 'flex', gap: 3 }}>
      {/* User List */}
      <Box sx={{ width: '30%', borderRight: '1px solid #ddd' }}>
        <Typography variant="h5" gutterBottom>
          Users
        </Typography>
        {loadingUsers ? (
          <CircularProgress />
        ) : users.length === 0 ? (
          <Typography>No users available to chat with.</Typography>
        ) : (
          <List>
            {users.map((u) => (
              <ListItem
                button
                key={u._id}
                onClick={() => setSelectedUser(u)}
                selected={selectedUser?._id === u._id}
              >
                <ListItemText primary={u.username} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Chat Window */}
      <Box sx={{ width: '70%' }}>
        {selectedUser ? (
          <>
            <Typography variant="h5" gutterBottom>
              Chat with {selectedUser.username}
            </Typography>
            <Box sx={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', p: 2, mb: 2 }}>
              {loadingMessages ? (
                <CircularProgress />
              ) : messages.length === 0 ? (
                <Typography>No messages yet.</Typography>
              ) : (
                messages.map((msg, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        mb: 1,
                        textAlign: msg.senderId === user._id ? 'right' : 'left',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          p: 1,
                          borderRadius: 2,
                          bgcolor: msg.senderId === user._id ? '#1976d2' : '#e0e0e0',
                          color: msg.senderId === user._id ? 'white' : 'black',
                        }}
                      >
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    {index < messages.length - 1 && <Divider sx={{ my: 1 }} />} {/* Add Divider between messages */}
                  </Box>
                ))
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Typography>Select a user to start chatting.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Chat;