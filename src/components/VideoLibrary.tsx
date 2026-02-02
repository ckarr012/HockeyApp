import { Play, Tag, Download } from 'lucide-react'

export default function VideoLibrary() {
  const videos = [
    { id: 1, title: 'Full Game vs Rival Rockets', date: 'Feb 15, 2026', duration: '60:00', tags: 15, score: '4-3' },
    { id: 2, title: 'Full Game vs Thunder Bears', date: 'Feb 8, 2026', duration: '58:30', tags: 12, score: '2-2 (OT)' },
    { id: 3, title: 'Practice - Power Play', date: 'Feb 10, 2026', duration: '45:00', tags: 8, score: '-' },
    { id: 4, title: 'Full Game vs Storm Eagles', date: 'Feb 1, 2026', duration: '59:15', tags: 10, score: '5-2' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Video Library</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Upload Video
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Games</option>
            <option>Home Games</option>
            <option>Away Games</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Types</option>
            <option>Full Game</option>
            <option>Practice</option>
            <option>Highlights</option>
          </select>
          <input
            type="text"
            placeholder="Search videos..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-40 h-24 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{video.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>{video.date}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                  <span>•</span>
                  <span>{video.tags} tags</span>
                  {video.score !== '-' && (
                    <>
                      <span>•</span>
                      <span className="font-medium">Final: {video.score}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Watch
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>Tag</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
