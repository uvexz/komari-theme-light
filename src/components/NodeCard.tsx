import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Activity, Cpu, HardDrive, MemoryStick, Network, BarChart3, Tag, Timer, BadgeDollarSign } from 'lucide-react';
import { useMemo, useCallback } from 'react';

interface NodeData {
  uuid: string;
  name: string;
  cpu_name: string;
  virtualization: string;
  arch: string;
  cpu_cores: number;
  os: string;
  gpu_name: string;
  region: string;
  mem_total: number;
  swap_total: number;
  disk_total: number;
  weight: number;
  price: number;
  billing_cycle: number;
  currency: string;
  expired_at: string;
  group: string;
  tags: string;
  created_at: string;
  updated_at: string;
  status?: 'online' | 'offline';
  stats?: {
    cpu: { usage: number };
    ram: { total: number; used: number };
    swap: { total: number; used: number };
    disk: { total: number; used: number };
    network: { up: number; down: number; totalUp: number; totalDown: number };
    load: { load1: number; load5: number; load15: number };
    uptime: number;
    process: number;
    connections: { tcp: number; udp: number };
  };
}

interface NodeCardProps {
  node: NodeData;
  onViewCharts?: (nodeUuid: string, nodeName: string) => void;
}

export function NodeCard({ node, onViewCharts }: NodeCardProps) {
  // 使用 useMemo 优化格式化函数，避免重复创建
  const formatBytes = useMemo(() => (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatSpeed = useMemo(() => (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const formatUptime = useMemo(() => (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return days > 0 ? `${days}天${hours > 0 ? `${hours}小时` : ''}` : `${hours}小时`;
  }, []);

  const formatRegion = useMemo(() => (region: string): string => {
    // 处理台湾地区 emoji 显示问题，在中国大陆显示为联合国旗帜
    if (region.includes('🇹🇼') || region.toLowerCase().includes('taiwan') || region.includes('台湾')) {
      return region.replace(/🇹🇼/g, '🇺🇳').replace(/taiwan/gi, 'Taiwan').replace(/台湾/g, 'Taiwan');
    }
    return region;
  }, []);

  const isOnline = useMemo(() => node.status === 'online', [node.status]);
  const stats = useMemo(() => node.stats, [node.stats]);

  // 解析标签，支持逗号和分号分隔
  const tagList = useMemo(() => {
    if (!node.tags) return [];
    return node.tags
      .split(/[,;]/)
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
  }, [node.tags]);

  // 计算资源使用率状态，用于动态颜色显示
  const cpuStatus = useMemo(() => {
    if (!stats) return 'normal';
    const usage = stats.cpu.usage;
    if (usage >= 80) return 'critical';
    if (usage >= 60) return 'warning';
    return 'normal';
  }, [stats]);

  const ramStatus = useMemo(() => {
    if (!stats) return 'normal';
    const usage = (stats.ram.used / stats.ram.total) * 100;
    if (usage >= 85) return 'critical';
    if (usage >= 70) return 'warning';
    return 'normal';
  }, [stats]);

  const diskStatus = useMemo(() => {
    if (!stats) return 'normal';
    const usage = (stats.disk.used / stats.disk.total) * 100;
    if (usage >= 90) return 'critical';
    if (usage >= 75) return 'warning';
    return 'normal';
  }, [stats]);

  // 获取状态对应的颜色类 - 使用 useMemo 避免重复计算
  const statusColors = useMemo(() => ({
    critical: 'text-red-500',
    warning: 'text-yellow-500',
    normal: ''
  }), []);

  // 获取进度条颜色 - 使用 useMemo 避免重复计算
  const progressColors = useMemo(() => ({
    critical: 'bg-red-500',
    warning: 'bg-yellow-500',
    normal: ''
  }), []);

  // 获取状态对应的颜色类
  const getStatusColor = useCallback((status: 'normal' | 'warning' | 'critical') => {
    return statusColors[status];
  }, [statusColors]);

  // 获取进度条颜色
  const getProgressColor = useCallback((status: 'normal' | 'warning' | 'critical') => {
    return progressColors[status];
  }, [progressColors]);

  return (
    <Card className={`group card-hover overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 ${isOnline ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-4 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`flex-shrink-0 relative ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              <Activity className="h-5 w-5" />
              {isOnline && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold truncate responsive-text-lg">{node.name}</CardTitle>
              <div className="text-sm text-muted-foreground responsive-text-sm truncate">{formatRegion(node.region)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={isOnline ? 'default' : 'secondary'}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isOnline ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              {isOnline ? '在线' : '离线'}
            </Badge>
            {onViewCharts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewCharts(node.uuid, node.name)}
                className="h-8 w-8 p-0 rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-105"
                title="查看历史数据"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {node.group && (
            <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200">
              {node.group}
            </Badge>
          )}

          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-full">
              {tagList.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                  <Tag className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-20">{tag.trim()}</span>
                </Badge>
              ))}
              {tagList.length > 2 && (
                <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  +{tagList.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5">
        {stats && (
          <>
            {/* CPU 使用率 */}
            <div className="space-y-2 group/cpu">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className={`h-4 w-4 ${getStatusColor(cpuStatus)} transition-colors duration-300`} />
                  <span className="text-sm font-medium">CPU</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${cpuStatus === 'critical' ? 'bg-red-100 text-red-800' : cpuStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {cpuStatus === 'critical' ? '高负载' : cpuStatus === 'warning' ? '中等负载' : '正常'}
                  </span>
                </div>
                <span className={`text-sm font-bold ${getStatusColor(cpuStatus)} transition-colors duration-300`}>
                  {stats.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={stats.cpu.usage}
                  className={`h-2.5 transition-all duration-500 ${getProgressColor(cpuStatus)}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-2.5 rounded-full pointer-events-none opacity-0 group-hover/cpu:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* 内存使用率 */}
            <div className="space-y-2 group/ram">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className={`h-4 w-4 ${getStatusColor(ramStatus)} transition-colors duration-300`} />
                  <span className="text-sm font-medium">内存</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(stats.ram.used)} / {formatBytes(stats.ram.total)}
                  </span>
                </div>
                <span className={`text-sm font-bold ${getStatusColor(ramStatus)} transition-colors duration-300`}>
                  {((stats.ram.used / stats.ram.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={(stats.ram.used / stats.ram.total) * 100}
                  className={`h-2.5 transition-all duration-500 ${getProgressColor(ramStatus)}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-2.5 rounded-full pointer-events-none opacity-0 group-hover/ram:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* 磁盘使用率 */}
            <div className="space-y-2 group/disk">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className={`h-4 w-4 ${getStatusColor(diskStatus)} transition-colors duration-300`} />
                  <span className="text-sm font-medium">磁盘</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(stats.disk.used)} / {formatBytes(stats.disk.total)}
                  </span>
                </div>
                <span className={`text-sm font-bold ${getStatusColor(diskStatus)} transition-colors duration-300`}>
                  {((stats.disk.used / stats.disk.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={(stats.disk.used / stats.disk.total) * 100}
                  className={`h-2.5 transition-all duration-500 ${getProgressColor(diskStatus)}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-2.5 rounded-full pointer-events-none opacity-0 group-hover/disk:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* 网络速度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-purple-500 transition-colors duration-300" />
                  <span className="text-sm font-medium">网络</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <span className="text-xs text-muted-foreground">↑ 上传</span>
                  <span className="text-xs font-bold text-blue-600">
                    {formatSpeed(stats.network.up)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <span className="text-xs text-muted-foreground">↓ 下载</span>
                  <span className="text-xs font-bold text-green-600">
                    {formatSpeed(stats.network.down)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 网络总流量和运行时间表格 */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {stats && (
            <>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Network className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">总入站</span>
                </div>
                <span className="text-xs font-bold">
                  {stats.network.totalUp ? formatBytes(stats.network.totalUp) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Network className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium">总出站</span>
                </div>
                <span className="text-xs font-bold">
                  {stats.network.totalDown ? formatBytes(stats.network.totalDown) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium">运行时间</span>
                </div>
                <span className="text-xs font-bold">{formatUptime(stats.uptime)}</span>
              </div>
            </>
          )}
          {(node.price > 0 || node.price === -1) && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BadgeDollarSign className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium">价格</span>
              </div>
              <span className="text-xs font-bold">
                {node.price === -1 ? '免费' : `${node.currency}${node.price}/${node.billing_cycle}天`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}