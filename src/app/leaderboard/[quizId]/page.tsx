'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { quizLeaderboardAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const typeIcon = (type: string) => type === 'registered' ? '🎓' : '🙋';
const typeLabel = (type: string) => type === 'registered' ? 'Registered' : 'Guest';

function exportToCSV(data: any[], quizTitle: string) {
  const header = ['Rank', 'Name', 'Type', 'Score', 'Correct', 'Total', 'Time (s)'];
  const rows = data.map(p => [p.rank, p.name, typeLabel(p.type), p.score, p.correctAnswers, p.totalQuestions, p.timeTaken]);
  const csv = [header, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quizTitle.replace(/\s+/g, '_')}_leaderboard.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 10;

export default function QuizLeaderboardPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [filter, setFilter] = useState<'all' | 'registered' | 'guest'>('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
    setPage(1);
    // eslint-disable-next-line
  }, [quizId, filter]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await quizLeaderboardAPI.getPublicLeaderboard(quizId, filter);
      setLeaderboard(res.data.data.leaderboard || []);
      setQuiz(res.data.data.quiz || null);
    } catch (err) {
      setLeaderboard([]);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeaderboard = leaderboard.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredLeaderboard.length / PAGE_SIZE);
  const paginated = filteredLeaderboard.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [pdfLoading, setPdfLoading] = useState(false);

  // Removed guest results logic

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
    {/* Removed Guest result view section */}
        <h1 className="text-3xl font-bold mb-2 text-[#0E2647] text-center">Leaderboard</h1>
        {quiz && (
          <div className="text-center mb-6">
            <div className="text-lg font-semibold">{quiz.title}</div>
            <div className="text-gray-500 text-sm">Status: {quiz.status} {quiz.isPublic && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Public</span>}</div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'registered' ? 'default' : 'outline'} onClick={() => setFilter('registered')}>Registered</Button>
            <Button variant={filter === 'guest' ? 'default' : 'outline'} onClick={() => setFilter('guest')}>Guest</Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48"
            />
            {/* <Button
              variant="outline"
              onClick={async () => {
                setPdfLoading(true);
                try {
                      // API URL environment variable 
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

                      const res = await fetch(`${API_URL}/live-leaderboard/${quizId}/export-pdf`, {
                        method: 'GET',
                      });

                      if (!res.ok) throw new Error('Failed to download PDF');

                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${quiz?.title?.replace(/\s+/g, '_') || 'quiz'}_leaderboard.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Error downloading PDF.');
                    } finally {
                      setPdfLoading(false);
                    }
                }}
              disabled={filteredLeaderboard.length === 0 || pdfLoading}
            >
              {pdfLoading ? 'Downloading PDF...' : 'Download PDF Result'}
            </Button> */}
          </div>
        </div>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correct</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                {/* Removed Time (s), Email and Mobile columns */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No participants yet.</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={i} className={p.rank === 1 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-2 font-bold">{p.rank}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    {p.type === 'registered' && p.avatar && (
                      <img src={p.avatar} alt="avatar" className="w-6 h-6 rounded-full border" />
                    )}
                    {p.name}
                  </td>
                  <td className="px-4 py-2">{typeIcon(p.type)} <span className="ml-1 text-xs">{typeLabel(p.type)}</span></td>
                  <td className="px-4 py-2">{p.score}</td>
                  <td className="px-4 py-2">{p.correctAnswers}</td>
                  <td className="px-4 py-2">{p.totalQuestions}</td>
                  {/* Removed Time (s), Email and Mobile columns */}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-3 py-2 text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
} 