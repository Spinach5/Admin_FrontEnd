import { Box, Typography, IconButton, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationBar({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          第 {page}/{totalPages} 页
        </Typography>
        <IconButton size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">每页</Typography>
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          variant="standard"
          disableUnderline
          sx={{ fontSize: '0.875rem', color: 'text.secondary', '& .MuiSelect-select': { py: 0, pr: 2 } }}
        >
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </Box>
    </Box>
  );
}
