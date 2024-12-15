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
    update: boolean;
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
          // true,
        );
      }

      setData(temp);
    });

    socket.on("teams_update", (teams_update) => {
      setData((data: any) => ({ ...data, teams: teams_update.teams }));
    });
  }

  function showMessage(team: string, points: number, update: boolean = false) {
    if (points === 0) return;

    setShowingMessage({
      team: team,
      points: points > 0 ? `+${points}` : `${points}`,
      positive: points > 0,
      update,
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
    <div className="bg-inherit px-7 lg:px-24">
      <header className="mb-3 mt-3 text-center">
        <div className="absolute left-5 top-4 flex items-center space-x-1">
          <img src="/logo.ico" className="mt-0.5 h-6 w-6" />
          <h3 className="text-xl font-bold">IIE TECH CLUB</h3>
        </div>

        <button
          className="absolute right-6 top-6 text-xl font-semibold"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <GoScreenFull />
        </button>

        <h1 className="text-5xl font-bold">"DECODE IT"</h1>
        <span className="text-xl font-semibold tracking-widest text-red-500">
          Let's decode it!
        </span>
      </header>

      <main className="">
        <div className="relative max-h-[490px] overflow-y-auto rounded-lg border border-gray-200 scrollbar-hide">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-2xl font-medium">
            <thead className="sticky top-0 z-10 bg-white text-left shadow-md">
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

            <tbody className="divide-y divide-transparent">
              {data?.teams
                .filter((team: any) => !team.hidden)
                .map(
                  (
                    { name, scores }: { name: string; scores: number[] },
                    idx: number,
                  ) => (
                    <tr key={`team_${idx}`} className="bg-green-100/90">
                      {name.length > 6 ? (
                        <td
                          className="-my-1.5 whitespace-nowrap px-4 font-bold text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: `
                        <marquee class="marq" direction="left" loop="">
                        ${name}
                        </marquee>
                        `,
                          }}
                        ></td>
                      ) : (
                        <td className="-my-1.5 whitespace-nowrap px-4 font-bold text-gray-900">
                          {name}
                        </td>
                      )}

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="-my-1.5 whitespace-nowrap px-4 text-center text-gray-700"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="-my-1.5 whitespace-nowrap px-4 text-center text-gray-700">
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
                    <tr key={`hidden_team_${idx}`} className="bg-red-200/90">
                      {name.length > 6 ? (
                        <td
                          className="-my-1.5 whitespace-nowrap px-4 font-bold text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: `
                        <marquee class="marq" direction="left" loop="">
                        ${name}
                        </marquee>
                        `,
                          }}
                        ></td>
                      ) : (
                        <td className="-my-1.5 whitespace-nowrap px-4 font-bold text-gray-900">
                          {name}
                        </td>
                      )}

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="-my-1.5 whitespace-nowrap px-4 text-center text-gray-700"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="-my-1.5 whitespace-nowrap px-4 text-center text-gray-700">
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
            className={`absolute bottom-16 left-1/2 w-[580px] -translate-x-1/2 rounded-lg border shadow-lg ${showingMessage.positive ? (showingMessage.update && "border-yellow-300") || "border-green-300" : "border-red-300"} ${showingMessage.positive ? (showingMessage.update && "bg-yellow-100") || "bg-green-200" : "bg-red-100"} px-4 py-1.5`}
            ref={messageRef}
          >
            <span className="line-clamp-1 text-center text-2xl">
              Team <span className="font-medium">{showingMessage.team}</span>{" "}
              got{" "}
              <span
                className={`font-medium ${showingMessage.positive ? (showingMessage.update && "text-yellow-600") || "text-green-600" : "text-red-600"} `}
              >
                {showingMessage.points}
              </span>{" "}
              points with a{" "}
              {showingMessage.positive ? (
                <span
                  className={`font-medium ${(showingMessage.update && "text-yellow-600") || "text-green-700"}`}
                >
                  Right Answer
                </span>
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
