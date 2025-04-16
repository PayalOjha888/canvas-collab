import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styled from 'styled-components';

const HeroSection = styled(Box)`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
`;

const FeatureCard = styled(Paper)`
  padding: 2rem;
  margin: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const HomePage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = () => {
    // TODO: Implement authentication logic
    navigate('/whiteboard');
  };

  return (
    <Box>
      <HeroSection>
        <Container>
          <Typography variant="h2" gutterBottom>
            CollabCanvas
          </Typography>
          <Typography variant="h5" gutterBottom>
            Real-time collaborative whiteboard for seamless team creativity
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => setOpen(true)}
            sx={{ mt: 3 }}
          >
            Get Started
          </Button>
        </Container>
      </HeroSection>

      <Container sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" flexWrap="wrap">
          <FeatureCard elevation={3}>
            <Typography variant="h6" gutterBottom>
              Real-time Collaboration
            </Typography>
            <Typography>
              Work together with your team in real-time with voice chat support
            </Typography>
          </FeatureCard>
          <FeatureCard elevation={3}>
            <Typography variant="h6" gutterBottom>
              Professional Tools
            </Typography>
            <Typography>
              Access a wide range of drawing tools with customizable options
            </Typography>
          </FeatureCard>
          <FeatureCard elevation={3}>
            <Typography variant="h6" gutterBottom>
              Export Options
            </Typography>
            <Typography>
              Save your work in PDF or JPG format for easy sharing
            </Typography>
          </FeatureCard>
        </Box>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {isLogin ? 'Login' : 'Sign Up'}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
          </Button>
          <Button variant="contained" onClick={handleAuth}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;