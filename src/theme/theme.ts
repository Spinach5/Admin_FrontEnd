import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2e9bfa' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export default theme;
