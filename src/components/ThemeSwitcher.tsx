import { useTheme } from '../hooks/useTheme';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'clean' as const, name: '简洁' },
    { id: 'sunrise' as const, name: '日出' },
    { id: 'green-mountain' as const, name: '青山' },
    { id: 'blue-water' as const, name: '绿水' },
    { id: 'night' as const, name: '夜晚' },
    { id: 'material-indigo' as const, name: 'Material Indigo' },
    { id: 'material-pink' as const, name: 'Material Pink' },
    { id: 'material-teal' as const, name: 'Material Teal' },
  ];

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="选择主题" />
      </SelectTrigger>
      <SelectContent>
        {themes.map(({ id, name }) => (
          <SelectItem key={id} value={id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}