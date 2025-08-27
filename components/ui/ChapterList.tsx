import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReadMoreText } from '@/components/ui/ReadMoreText';

interface Chapter {
  id: string | number;
  name: string;
  description?: string;
  foundation_date: string;
  location?: string;
  total_members?: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  className?: string;
}

export function ChapterList({ chapters, className }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <div className="text-gray-400 text-6xl mb-4">📍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay capítulos</h3>
        <p className="text-gray-600">No se encontraron capítulos para este club.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className || ''}`}>
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 rounded-lg border text-sm font-medium text-gray-700">
        <div className="col-span-6">Capítulo</div>
        <div className="col-span-3 text-center">Miembros</div>
        <div className="col-span-3 text-center">Fundación</div>
      </div>

      {/* Chapter Rows */}
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
            <Card className="hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer">
              <CardContent className="p-0">
                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center px-6 py-4">
                  {/* Chapter Name & Description */}
                  <div className="col-span-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{chapter.name}</h3>
                    {chapter.description && (
                      <ReadMoreText
                        text={chapter.description}
                        maxLength={80}
                        className="text-sm text-gray-600"
                      />
                    )}
                  </div>

                  {/* Member Count */}
                  <div className="col-span-3 text-center">
                    {chapter.total_members !== undefined ? (
                      <div className="inline-flex items-center">
                        <Badge variant="secondary" className="text-sm">
                          👥 {chapter.total_members}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>

                  {/* Foundation Date */}
                  <div className="col-span-3 text-center">
                    <div className="inline-flex items-center">
                      <Badge variant="outline" className="text-sm">
                        📅{' '}
                        {new Date(chapter.foundation_date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden p-3 space-y-2">
                  {/* Header */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{chapter.name}</h3>
                    {chapter.description && (
                      <ReadMoreText
                        text={chapter.description}
                        maxLength={60}
                        className="text-xs text-gray-600"
                      />
                    )}
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center justify-between text-xs">
                    {/* Member Count */}
                    <div className="flex items-center gap-1">
                      {chapter.total_members !== undefined ? (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          👥 {chapter.total_members}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin miembros</span>
                      )}
                    </div>

                    {/* Foundation Date */}
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">
                        📅{' '}
                        {new Date(chapter.foundation_date).toLocaleDateString('es-MX', {
                          year: '2-digit',
                          month: 'short',
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total de capítulos: <span className="font-medium text-gray-900">{chapters.length}</span>
          </span>
          {chapters.some((c) => c.total_members !== undefined) && (
            <span>
              Total de miembros:{' '}
              <span className="font-medium text-gray-900">
                {chapters.reduce((sum, chapter) => sum + (chapter.total_members || 0), 0)}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
