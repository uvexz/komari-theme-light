import { ThemeSwitcher } from './components/ThemeSwitcher'
import { NodeList } from './components/NodeList'
import { NodeCharts } from './components/NodeCharts'
import { WebSocketStatus } from './components/WebSocketStatus'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { useNodes } from './hooks/useNodes'
import { Activity, Server, AlertCircle, ArrowLeft, Settings, Network } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState<{ uuid: string; name: string } | null>(null);
  const [siteName, setSiteName] = useState<string>('Komari Monitor');

  const {
    nodes,
    loading,
    error,
    refreshNodes,
    getOnlineCount,
    getOfflineCount,
    getGroups
  } = useNodes();

  // 获取站点名称
  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const publicSettings = await apiService.getPublicSettings();
        if (publicSettings && publicSettings.sitename) {
          setSiteName(publicSettings.sitename);
        }
      } catch (error) {
        console.error('Failed to fetch site name:', error);
      }
    };

    fetchSiteName();
  }, []);

  const onlineCount = getOnlineCount();
  const offlineCount = getOfflineCount();
  const groups = getGroups();

  // 计算所有节点的网络统计
  const getTotalNetworkStats = () => {
    let totalUp = 0;
    let totalDown = 0;
    let totalUpTraffic = 0;
    let totalDownTraffic = 0;

    nodes.forEach(node => {
      if (node.status === 'online' && node.stats?.network) {
        totalUp += node.stats.network.up || 0;
        totalDown += node.stats.network.down || 0;
        totalUpTraffic += node.stats.network.totalUp || 0;
        totalDownTraffic += node.stats.network.totalDown || 0;
      }
    });

    return { totalUp, totalDown, totalUpTraffic, totalDownTraffic };
  };

  const networkStats = getTotalNetworkStats();

  // 格式化网络速度，自动选择合适的单位
  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化流量，自动选择合适的单位
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewCharts = (nodeUuid: string, nodeName: string) => {
    setSelectedNode({ uuid: nodeUuid, name: nodeName });
  };

  const handleBackToList = () => {
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth px-3">
      <header className="border-b border-border sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto py-3 sm:py-4 flex justify-between items-center mobile-stack">
          <div>
            <h1 className="responsive-text-xl sm:responsive-text-2xl font-bold">{siteName}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mobile-full-width mobile-center">
            <WebSocketStatus />
            <ThemeSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/admin'}
              className="btn-animate text-xs sm:text-sm"
            >
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">管理后台</span>
              <span className="sm:hidden">后台</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-4 sm:py-6 md:py-8">
        {selectedNode ? (
          /* 节点图表视图 */
          <div>
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 mobile-stack">
              <Button variant="outline" onClick={handleBackToList} className="btn-animate text-xs sm:text-sm">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                返回节点列表
              </Button>
            </div>
            <NodeCharts
              nodeUuid={selectedNode.uuid}
              nodeName={selectedNode.name}
            />
          </div>
        ) : (
          /* 节点列表视图 */
          <>
            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    服务器总数
                  </CardTitle>
                  <Server className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-5">{nodes.length}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {groups.length} 个分组
                    </p>
                    {nodes.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        正常
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    在线服务器
                  </CardTitle>
                  <Activity className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-5">{onlineCount}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {nodes.length > 0 ? ((onlineCount / nodes.length) * 100).toFixed(1) : 0}% 可用率
                    </p>
                    {onlineCount === nodes.length && nodes.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        全部在线
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    离线服务器
                  </CardTitle>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-5">{offlineCount}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      需要关注
                    </p>
                    {offlineCount > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium animate-pulse">
                        需要检查
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    网络统计
                  </CardTitle>
                  <Network className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-600 mb-1">
                    ↑ {formatSpeed(networkStats.totalUp)}
                  </div>
                  <div className="text-xl font-bold text-purple-600 mb-5">
                    ↓ {formatSpeed(networkStats.totalDown)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      总上传: {formatBytes(networkStats.totalUpTraffic)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      总下载: {formatBytes(networkStats.totalDownTraffic)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 错误提示 */}
            {error && (
              <Card className="mb-4 sm:mb-6 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-3 text-red-800">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">连接错误</p>
                      <p className="text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 节点列表 */}
            <NodeList
              nodes={nodes}
              loading={loading}
              onRefresh={refreshNodes}
              onViewCharts={handleViewCharts}
            />
          </>
        )}
      </main>

      <footer className="border-t border-border mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-muted-foreground responsive-text-xs">
          Powered by{' '}
          <a
            href="https://github.com/komari-monitor/komari"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Komari Monitor
          </a>
          {' '}with{' '}
          <a
            href="https://github.com/uvexz/komari-theme-light"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Theme Light
          </a>
          .
        </div>
      </footer>
    </div>
  )
}

export default App
