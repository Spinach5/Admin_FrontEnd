import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Button, Skeleton, IconButton,
} from '@mui/material';
import { Refresh, Edit, Delete } from '@mui/icons-material';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyText?: string;
}

export function DataTable<T extends { id: number }>({
  columns, data, loading, error, onRefresh, onEdit, onDelete, emptyText = '暂无数据',
}: Props<T>) {
  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography sx={{ mb: 2 }} color="error">{error}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh}>重试</Button>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography sx={{ mb: 2 }} color="text.secondary">{emptyText}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh}>刷新</Button>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8f9fc' }}>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: 700, width: col.width }}>{col.label}</TableCell>
            ))}
            {(onEdit || onDelete) && <TableCell sx={{ fontWeight: 700, width: 120 }}>操作</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} hover>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  {onEdit && (
                    <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
