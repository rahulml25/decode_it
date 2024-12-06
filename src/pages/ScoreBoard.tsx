import { useEffect, useRef, useState } from "react";
import { io as socketIO } from "socket.io-client";
import { GoScreenFull } from "react-icons/go";

const socket = socketIO({ autoConnect: false });

export default function ScoreBoard() {
  const [_, setIsFullscreen] = useState(false);
  const [data, setData] = useState<any>(null);

  const messageRef = useRef<HTMLDivElement>(null);
  const [showingMessage, setShowingMessage] = useState<{
    team: string;
    points: string;
    positive: boolean;
  } | null>(null);

  function toggleFullscreen() {
    setIsFullscreen((isFullscreen) => {
      if (isFullscreen === true) {
        document.exitFullscreen();
        return false;
      } else {
        document.documentElement.requestFullscreen();
        return true;
      }
    });
  }

  async function fetchData() {
    const res = await fetch("/api/scores");
    if (!res.ok) return;

    const data = await res.json();
    setData(data);

    socket.on("score_update", (score_update) => {
      const temp = { ...data };
      temp.teams[score_update.teamId - 1].scores[score_update.roundId - 1] =
        score_update.points;

      if (Object.hasOwn(score_update, "count")) {
        showMessage(
          temp.teams[score_update.teamId - 1].name,
          score_update.count,
        );
      }

      setData(temp);
    });

    socket.on("teams_update", (teams_update) => {
      setData((data: any) => ({ ...data, teams: teams_update.teams }));
    });
  }

  function showMessage(team: string, points: number) {
    if (points === 0) return;

    setShowingMessage({
      team: team,
      points: points > 0 ? `+${points}` : `-${points}`,
      positive: points > 0,
    });

    setTimeout(() => {
      setShowingMessage(null);
    }, 4000);
  }

  useEffect(() => {
    socket.connect();
    fetchData();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-inherit px-14 lg:px-24">
      <header className="my-12 text-center">
        <div className="absolute left-5 top-5 flex items-center space-x-1">
          <img src="/logo.ico" className="mt-0.5 h-8 w-8" />
          <h3 className="text-2xl font-bold">IIE TECH CLUB</h3>
        </div>

        <button
          className="absolute right-6 top-6 text-xl font-semibold"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <GoScreenFull />
        </button>

        <h1 className="mb-1 text-5xl font-bold">"DECODE IT"</h1>
        <span className="text-xl font-semibold tracking-widest text-yellow-500">
          Let's decode it!
        </span>
      </header>

      <main className="my-12">
        <div className="relative max-h-[545px] overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-2xl font-medium">
            <thead className="sticky top-0 bg-white text-left shadow-md">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">
                  Teams
                </th>

                {data?.rounds.map((name: string, idx: number) => (
                  <th
                    key={`head_${idx}`}
                    className="whitespace-nowrap px-4 py-2 font-bold text-gray-900"
                  >
                    {name}
                  </th>
                ))}

                <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data?.teams
                .filter((team: any) => !team.hidden)
                .map(
                  (
                    { name, scores }: { name: string; scores: number[] },
                    idx: number,
                  ) => (
                    <tr key={`team_${idx}`}>
                      <td className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">
                        {name}
                      </td>

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="whitespace-nowrap px-4 py-2 text-gray-700"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {scores?.reduce((a: number, b: number) => a + b, 0)}
                      </td>
                    </tr>
                  ),
                )}

              {data?.teams
                .filter((team: any) => team.hidden)
                .map(
                  (
                    { name, scores }: { name: string; scores: number[] },
                    idx: number,
                  ) => (
                    <tr key={`hidden_team_${idx}`} className="bg-gray-100">
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-700">
                        {name}
                      </td>

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="whitespace-nowrap px-4 py-2 text-gray-500"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="whitespace-nowrap px-4 py-2 text-gray-500">
                        {scores?.reduce((a: number, b: number) => a + b, 0)}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>

        {showingMessage !== null && (
          <div
            className={`absolute bottom-16 left-1/2 w-fit -translate-x-1/2 rounded-lg border shadow-lg ${showingMessage.positive ? "border-green-300" : "border-red-300"} ${showingMessage.positive ? "bg-green-100" : "bg-red-100"} px-4 py-1.5`}
            ref={messageRef}
          >
            <span className="line-clamp-1 text-2xl">
              Team <span className="font-medium">{showingMessage.team}</span>{" "}
              got{" "}
              <span
                className={`font-medium ${showingMessage.positive ? "text-green-600" : "text-red-600"} `}
              >
                {showingMessage.points}
              </span>{" "}
              points with a{" "}
              {showingMessage.positive ? (
                <span className="font-medium text-green-600">Right Answer</span>
              ) : (
                <span className="font-medium text-red-600">Wrong Answer</span>
              )}
              .
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
