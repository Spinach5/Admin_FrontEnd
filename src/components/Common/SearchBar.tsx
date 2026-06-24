import { Box, TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export interface SearchField {
  key: string;
  label: string;
}

interface Props {
  fields: SearchField[];
  keyword: string;
  field: string;
  onKeywordChange: (keyword: string) => void;
  onFieldChange: (field: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function SearchBar({ fields, keyword, field, onKeywordChange, onFieldChange, onSearch, onClear }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>搜索字段</InputLabel>
        <Select
          value={field}
          label="搜索字段"
          onChange={(e) => onFieldChange(e.target.value)}
        >
          <MenuItem value="">全部字段</MenuItem>
          {fields.map((f) => (
            <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="搜索关键词"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
        sx={{ flexGrow: 1 }}
      />
      <Button variant="contained" startIcon={<Search />} onClick={onSearch} size="small">
        搜索
      </Button>
      {keyword && (
        <Button variant="outlined" startIcon={<Clear />} onClick={onClear} size="small">
          清除
        </Button>
      )}
    </Box>
  );
}
