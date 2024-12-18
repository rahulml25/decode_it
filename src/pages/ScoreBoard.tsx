import { useEffect, useRef, useState } from "react";
import { io as socketIO } from "socket.io-client";
import { GoScreenFull } from "react-icons/go";

const socket = socketIO({ autoConnect: false });

export default function ScoreBoard() {
  const setIsFullscreen = useRef(false);
  const [data, setData] = useState<any>(null);

  const messageRef = useRef<HTMLDivElement>(null);
  const [showingMessage, setShowingMessage] = useState<{
    team: string;
    points: string;
    positive: boolean;
    update: boolean;
  } | null>(null);

  function toggleFullscreen() {
    if (setIsFullscreen.current) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  async function fetchData() {
    const res = await fetch("/api/scores");
    if (!res.ok) return;

    const data = await res.json();
    setData(data);

    socket.on("score_update", (score_update) => {
      const temp = { ...data };

      const teamIdx = (temp.teams as any[]).findIndex(
        (team) => team.id === score_update.teamId,
      );
      temp.teams[teamIdx].scores[score_update.roundId - 1] =
        score_update.points;

      if (Object.hasOwn(score_update, "count")) {
        showMessage(
          temp.teams[teamIdx].name,
          score_update.count,
          Object.hasOwn(score_update, "update") && score_update.update,
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

  const totalScore = (teamScores: any[]) => {
    return teamScores?.reduce((a: number, b: number) => a + b, 0);
  };

  useEffect(() => {
    socket.connect();
    fetchData();
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function listener() {
      setIsFullscreen.current = document.fullscreenElement === document.documentElement;
    }

    document.addEventListener("fullscreenchange", listener);

    return () => {
      document.removeEventListener("fullscreenchange", listener);
    };
  }, []);

  return (
    <div className="bg-inherit px-7 lg:px-24">
      <header className="mb-3 mt-3 text-center">
        <div className="absolute left-5 top-4 flex items-center space-x-1">
          <img src="/logo.ico" className="mt-0.5 h-6 w-6"  alt="club logo"/>
          <h3 className="text-lg font-bold md:text-xl">IIE TECH CLUB</h3>
        </div>

        <button
          className="absolute right-6 top-6 text-xl font-semibold"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <GoScreenFull />
        </button>

        <h1 className="text-4xl font-bold md:text-5xl">"DECODE IT"</h1>
        <span className="text-lg font-semibold tracking-widest text-red-500 md:text-xl">
          Let's decode it!
        </span>
      </header>

      <main>
        <div className="relative max-h-[500px] overflow-y-auto rounded-lg border border-gray-200 scrollbar-hide">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-2xl font-medium">
            <thead className="sticky top-0 z-10 bg-white text-left shadow-md">
              <tr>
                <th className="max-w-[125px] whitespace-nowrap px-4 py-2 font-bold text-gray-900">
                  Teams
                </th>

                {data?.rounds.map((name: string, idx: number) =>
                  name.length > 6 ? (
                    <th
                      key={`head_${idx}`}
                      className="max-w-[125px] whitespace-nowrap px-4 py-2 text-center font-bold text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: `
                          <marquee direction="left" loop scrollamount="4">
                          ${name}
                          </marquee>
                          `,
                      }}
                    ></th>
                  ) : (
                    <th
                      key={`head_${idx}`}
                      className="max-w-[125px] whitespace-nowrap px-4 py-2 text-center font-bold text-gray-900"
                    >
                      {name}
                    </th>
                  ),
                )}

                <th className="max-w-[125px] whitespace-nowrap px-4 py-2 text-center font-bold text-gray-900">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-300">
              {data?.teams
                .filter((team: any) => !team.hidden)
                .sort(
                  (a: any, b: any) =>
                    totalScore(b.scores) - totalScore(a.scores),
                )
                .map(
                  ({
                    id,
                    name,
                    scores,
                  }: {
                    id: number;
                    name: string;
                    scores: number[];
                  }) => (
                    <tr key={`team_${id}`} className="divide-x bg-green-100/90">
                      {name.length > 6 ? (
                        <td
                          className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 font-bold text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: `
                        <marquee direction="left" loop scrollamount="4">
                        ${name}
                        </marquee>
                        `,
                          }}
                        ></td>
                      ) : (
                        <td className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 font-bold text-gray-900">
                          {name}
                        </td>
                      )}

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 text-center text-gray-700"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 text-center text-gray-700">
                        {scores?.reduce((a: number, b: number) => a + b, 0)}
                      </td>
                    </tr>
                  ),
                )}

              {data?.teams
                .sort(
                  (a: any, b: any) =>
                    totalScore(b.scores) - totalScore(a.scores),
                )
                .filter((team: any) => team.hidden)
                .map(
                  ({
                    id,
                    name,
                    scores,
                  }: {
                    id: number;
                    name: string;
                    scores: number[];
                  }) => (
                    <tr
                      key={`hidden_team_${id}`}
                      className="divide-x bg-red-200/90"
                    >
                      {name.length > 6 ? (
                        <td
                          className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 font-bold text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: `
                        <marquee direction="left" loop scrollamount="4">
                        ${name}
                        </marquee>
                        `,
                          }}
                        ></td>
                      ) : (
                        <td className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 font-bold text-gray-900">
                          {name}
                        </td>
                      )}

                      {scores?.map((score: number, idx: number) => (
                        <td
                          className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 text-center text-gray-700"
                          key={`round_${idx}`}
                        >
                          {score}
                        </td>
                      ))}

                      <td className="-my-1.5 max-w-[125px] whitespace-nowrap px-4 text-center text-gray-700">
                        {totalScore(scores)}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>

        {showingMessage !== null && (
          <div
            className={`absolute bottom-16 left-1/2 w-max max-w-[calc(100dvw_-_96px)] -translate-x-1/2 whitespace-pre-wrap text-wrap rounded-lg border shadow-lg ${showingMessage.update ? "border-yellow-300" : (showingMessage.positive && "border-green-300") || "border-red-300"} ${showingMessage.update ? "bg-yellow-100" : (showingMessage.positive && "bg-green-200") || "bg-red-100"} px-4 py-1.5`}
            ref={messageRef}
          >
            <span className="text-center text-xl md:text-2xl">
              Team <span className="font-medium">{showingMessage.team}</span>{" "}
              got{" "}
              <span
                className={`font-medium ${showingMessage.positive ? "text-green-600" : "text-red-600"} `}
              >
                {showingMessage.points}
              </span>{" "}
              points with a{" "}
              {showingMessage.positive ? (
                <span className="font-medium text-green-700">Right Answer</span>
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
